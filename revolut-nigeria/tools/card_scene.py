"""Shared Blender (bpy) helpers: the physical card model and its materials.

Run with a Python that has `bpy` installed (pip install bpy). Units are metres
in an arbitrary scale: the card is CARD_W x CARD_H with CARD_H = 1.
"""
from __future__ import annotations

import math
import os

import bmesh
import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")

# ID-1 card: 53.98 x 85.60 mm, corner radius 3.18 mm. Height normalised to 1.
CARD_H = 1.0
CARD_W = 53.98 / 85.60
CARD_R = 3.18 / 85.60
# 0.76 mm is the ISO thickness; a metal card is a little thicker and reads
# better at the size it has in the photograph.
CARD_T = 1.25 / 85.60
BEVEL = 0.16 / 85.60


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.use_denoising = True
    try:
        scene.cycles.denoiser = "OPENIMAGEDENOISE"
    except TypeError:
        pass
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "16"
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.render.threads_mode = "AUTO"
    return scene


def _image(name):
    path = os.path.join(OUT, name)
    img = bpy.data.images.load(path, check_existing=True)
    return img


def _tex(nodes, links, name, uv, colorspace="sRGB"):
    node = nodes.new("ShaderNodeTexImage")
    node.image = _image(name)
    node.image.colorspace_settings.name = colorspace
    node.extension = "CLIP"
    node.interpolation = "Cubic"
    links.new(uv, node.inputs["Vector"])
    return node


def _set(bsdf, **values):
    for key, value in values.items():
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = value


def make_face_material(finish):
    """Front face: anodised navy metal with foil wordmark, printed details and a chip."""
    mat = bpy.data.materials.new("CardFace")
    mat.use_nodes = True
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    uv = nodes.new("ShaderNodeTexCoord").outputs["UV"]

    logo = _tex(nodes, links, "face_logo.png", uv)
    details = _tex(nodes, links, "face_details.png", uv)
    chip = _tex(nodes, links, "face_chip.png", uv)
    rim = _tex(nodes, links, "face_rim.png", uv)

    # --- a real card is never optically flat. A slight bow (in the shading
    # normal only, so the silhouette and its corners stay exact) lets the face
    # sweep a wide arc of sky instead of mirroring a single patch of it.
    bow_x, bow_y = finish.get("bow", (0.0, 0.0))
    centred = nodes.new("ShaderNodeVectorMath")
    centred.operation = "SUBTRACT"
    centred.inputs[1].default_value = (0.5, 0.5, 0.0)
    links.new(uv, centred.inputs[0])
    tilt = nodes.new("ShaderNodeVectorMath")
    tilt.operation = "MULTIPLY"
    tilt.inputs[1].default_value = (bow_x, bow_y, 0.0)
    links.new(centred.outputs["Vector"], tilt.inputs[0])
    lifted = nodes.new("ShaderNodeVectorMath")
    lifted.operation = "ADD"
    lifted.inputs[1].default_value = (0.0, 0.0, 1.0)
    links.new(tilt.outputs["Vector"], lifted.inputs[0])
    to_world = nodes.new("ShaderNodeVectorTransform")
    to_world.vector_type = "NORMAL"
    to_world.convert_from = "OBJECT"
    to_world.convert_to = "WORLD"
    links.new(lifted.outputs["Vector"], to_world.inputs["Vector"])
    unit = nodes.new("ShaderNodeVectorMath")
    unit.operation = "NORMALIZE"
    links.new(to_world.outputs["Vector"], unit.inputs[0])
    bowed = unit.outputs["Vector"]

    # --- base: deep navy, satin metal under a clear lacquer
    base = nodes.new("ShaderNodeBsdfPrincipled")
    _set(
        base,
        **{
            "Base Color": (*finish["base"], 1.0),
            "Metallic": finish["metallic"],
            "Roughness": finish["roughness"],
            "Coat Weight": finish["coat"],
            "Coat Roughness": finish["coat_roughness"],
            "IOR": 1.5,
        },
    )
    # very fine brushed grain: breaks up reflections the way anodised metal does
    grain = nodes.new("ShaderNodeTexNoise")
    grain.inputs["Scale"].default_value = 900.0
    grain.inputs["Detail"].default_value = 2.0
    stretch = nodes.new("ShaderNodeMapping")
    stretch.inputs["Scale"].default_value = (1.0, 0.012, 1.0)
    links.new(uv, stretch.inputs["Vector"])
    links.new(stretch.outputs["Vector"], grain.inputs["Vector"])
    rough = nodes.new("ShaderNodeMapRange")
    rough.inputs["From Min"].default_value = 0.3
    rough.inputs["From Max"].default_value = 0.7
    rough.inputs["To Min"].default_value = finish["roughness"] - 0.035
    rough.inputs["To Max"].default_value = finish["roughness"] + 0.035
    links.new(grain.outputs["Fac"], rough.inputs["Value"])
    links.new(rough.outputs["Result"], base.inputs["Roughness"])
    links.new(bowed, base.inputs["Normal"])
    if "Coat Normal" in base.inputs:
        links.new(bowed, base.inputs["Coat Normal"])

    # --- wordmark: bright silver foil
    foil = nodes.new("ShaderNodeBsdfPrincipled")
    _set(
        foil,
        **{
            "Base Color": (*finish["foil"], 1.0),
            "Metallic": finish["foil_metallic"],
            "Roughness": 0.3,
            "Coat Weight": 0.0,
        },
    )
    # --- printed details: pale ink
    ink = nodes.new("ShaderNodeBsdfPrincipled")
    _set(ink, **{"Base Color": (*finish["ink"], 1.0), "Metallic": 0.0, "Roughness": 0.55})
    links.new(bowed, ink.inputs["Normal"])

    # --- chip: gold contact plate, grooves from the artwork's own shading
    plate = nodes.new("ShaderNodeBsdfPrincipled")
    _set(plate, **{"Metallic": finish.get("chip_metallic", 1.0), "Roughness": 0.26})
    warm = nodes.new("ShaderNodeMixRGB")
    warm.blend_type = "MULTIPLY"
    warm.inputs["Fac"].default_value = 1.0
    warm.inputs["Color2"].default_value = (1.0, 0.9, 0.68, 1.0)
    links.new(chip.outputs["Color"], warm.inputs["Color1"])
    links.new(warm.outputs["Color"], plate.inputs["Base Color"])

    def bump(height_socket, strength, distance, invert=False):
        node = nodes.new("ShaderNodeBump")
        node.inputs["Strength"].default_value = strength
        node.inputs["Distance"].default_value = distance
        node.invert = invert
        links.new(height_socket, node.inputs["Height"])
        links.new(bowed, node.inputs["Normal"])
        return node.outputs["Normal"]

    links.new(bump(logo.outputs["Alpha"], 0.5, 0.0006), foil.inputs["Normal"])
    chip_lum = nodes.new("ShaderNodeRGBToBW")
    links.new(chip.outputs["Color"], chip_lum.inputs["Color"])
    links.new(bump(chip_lum.outputs["Val"], 0.6, 0.0012), plate.inputs["Normal"])

    def mix(a, b, fac):
        node = nodes.new("ShaderNodeMixShader")
        links.new(fac, node.inputs["Fac"])
        links.new(a, node.inputs[1])
        links.new(b, node.inputs[2])
        return node.outputs["Shader"]

    # --- light inlay: a fine metal line that can glow, strongest on the top
    # and right edges (the "selected edges")
    inlay = nodes.new("ShaderNodeBsdfPrincipled")
    _set(inlay, **{"Base Color": (0.55, 0.62, 0.78, 1.0), "Metallic": 1.0, "Roughness": 0.22})
    if finish.get("rim_light", 0.0) > 0:
        sep = nodes.new("ShaderNodeSeparateXYZ")
        links.new(uv, sep.inputs["Vector"])

        def ramp(socket, lo, hi):
            node = nodes.new("ShaderNodeMapRange")
            node.interpolation_type = "SMOOTHSTEP"
            node.inputs["From Min"].default_value = lo
            node.inputs["From Max"].default_value = hi
            links.new(socket, node.inputs["Value"])
            return node.outputs["Result"]

        weight = nodes.new("ShaderNodeMath")
        weight.operation = "MAXIMUM"
        links.new(ramp(sep.outputs["X"], 0.45, 0.97), weight.inputs[0])
        links.new(ramp(sep.outputs["Y"], 0.55, 0.985), weight.inputs[1])
        floor = nodes.new("ShaderNodeMapRange")
        floor.inputs["To Min"].default_value = finish.get("rim_floor", 0.18)
        floor.inputs["To Max"].default_value = 1.0
        links.new(weight.outputs["Value"], floor.inputs["Value"])
        gain = nodes.new("ShaderNodeMath")
        gain.operation = "MULTIPLY"
        gain.inputs[1].default_value = finish["rim_light"]
        links.new(floor.outputs["Result"], gain.inputs[0])
        _set(inlay, **{"Emission Color": (*finish["rim_light_color"], 1.0)})
        links.new(gain.outputs["Value"], inlay.inputs["Emission Strength"])

    shader = mix(base.outputs["BSDF"], ink.outputs["BSDF"], details.outputs["Alpha"])
    shader = mix(shader, inlay.outputs["BSDF"], rim.outputs["Alpha"])
    shader = mix(shader, foil.outputs["BSDF"], logo.outputs["Alpha"])
    shader = mix(shader, plate.outputs["BSDF"], chip.outputs["Alpha"])
    links.new(shader, out.inputs["Surface"])
    return mat


def make_edge_material(finish):
    """Polished chamfer and side walls."""
    mat = bpy.data.materials.new("CardEdge")
    mat.use_nodes = True
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    _set(
        bsdf,
        **{
            "Base Color": (*finish["edge"], 1.0),
            "Metallic": 1.0,
            "Roughness": 0.16,
        },
    )
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def make_matte_material(white):
    mat = bpy.data.materials.new("MatteWhite" if white else "MatteBlack")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    v = 1.0 if white else 0.0
    em.inputs["Color"].default_value = (v, v, v, 1.0)
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def make_front_matte_material():
    """White wherever the surface faces forward (the face and its chamfer),
    black on the walls and the back: the outline the corners are measured from."""
    mat = bpy.data.materials.new("FrontMatte")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    to_obj = nt.nodes.new("ShaderNodeVectorTransform")
    to_obj.vector_type = "NORMAL"
    to_obj.convert_from = "WORLD"
    to_obj.convert_to = "OBJECT"
    nt.links.new(geo.outputs["True Normal"], to_obj.inputs["Vector"])
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(to_obj.outputs["Vector"], sep.inputs["Vector"])
    front = nt.nodes.new("ShaderNodeMath")
    front.operation = "GREATER_THAN"
    front.inputs[1].default_value = 0.2
    nt.links.new(sep.outputs["Z"], front.inputs[0])
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(front.outputs["Value"], em.inputs["Color"])
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def make_rim_pass_material():
    """Only the light inlay, white on black: the source of the bloom."""
    mat = bpy.data.materials.new("RimPass")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    uv = nt.nodes.new("ShaderNodeTexCoord").outputs["UV"]
    rim = _tex(nt.nodes, nt.links, "face_rim.png", uv)
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(rim.outputs["Alpha"], em.inputs["Color"])
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def override_materials(obj, face, edge):
    obj.data.materials[0] = face
    obj.data.materials[1] = edge


def build_card(finish, name="Card"):
    """Rounded, chamfered card. Local axes: X width, Y height, +Z is the front."""
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    hw, hh = CARD_W / 2, CARD_H / 2
    verts = [bm.verts.new((x, y, 0.0)) for x, y in ((-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh))]
    bm.faces.new(verts)
    bmesh.ops.bevel(
        bm, geom=list(bm.verts), offset=CARD_R, segments=28, profile=0.5, affect="VERTICES"
    )
    uv = bm.loops.layers.uv.new("UVMap")
    for face in bm.faces:
        for loop in face.loops:
            co = loop.vert.co
            loop[uv].uv = (co.x / CARD_W + 0.5, co.y / CARD_H + 0.5)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    solid = obj.modifiers.new("Solidify", "SOLIDIFY")
    solid.thickness = CARD_T
    solid.offset = -1.0  # the original plane stays the front face at z = 0
    bevel = obj.modifiers.new("Bevel", "BEVEL")
    bevel.width = BEVEL
    bevel.segments = 4
    bevel.limit_method = "ANGLE"
    bevel.angle_limit = math.radians(50)
    bpy.ops.object.modifier_apply(modifier=solid.name)
    bpy.ops.object.modifier_apply(modifier=bevel.name)

    mesh.materials.append(make_face_material(finish))
    mesh.materials.append(make_edge_material(finish))
    for poly in mesh.polygons:
        front = poly.normal.z > 0.999 and poly.center.z > -CARD_T * 0.25
        poly.material_index = 0 if front else 1
        poly.use_smooth = not front
    return obj


def card_front_corners(obj):
    """World-space corners of the front face: TL, TR, BR, BL (as seen from +Z)."""
    hw, hh = CARD_W / 2, CARD_H / 2
    local = [(-hw, hh), (hw, hh), (hw, -hh), (-hw, -hh)]
    return [obj.matrix_world @ Vector((x, y, 0.0)) for x, y in local]


def project(scene, camera, point):
    """World point -> pixel coordinates (x right, y down), sub-pixel."""
    from bpy_extras.object_utils import world_to_camera_view

    co = world_to_camera_view(scene, camera, point)
    return (co.x * scene.render.resolution_x, (1.0 - co.y) * scene.render.resolution_y)


FINISH_MIDNIGHT = {
    "base": (0.010, 0.020, 0.058),
    "metallic": 0.82,
    "roughness": 0.36,
    "coat": 0.55,
    "coat_roughness": 0.07,
    "foil": (0.86, 0.88, 0.92),
    "foil_metallic": 0.55,
    "ink": (0.62, 0.66, 0.74),
    "edge": (0.05, 0.08, 0.16),
    "bow": (0.0, 0.0),
    "rim_light": 0.0,
    "rim_floor": 0.18,
    "rim_light_color": (0.10, 0.42, 1.0),
}
