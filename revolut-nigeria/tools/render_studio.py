"""Second-screen card: a studio product render on a transparent background.

    python tools/render_studio.py [--samples 384] [--scale 1.0] [--webp]

Writes tools/out/studio_card.png (RGBA, 1440 x 810). With --webp it also
writes src/assets/revolut-card.webp, the image the second screen floats.
"""
from __future__ import annotations

import argparse
import math
import os
import sys

import bpy
from mathutils import Euler, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import card_scene as cs  # noqa: E402

WIDTH, HEIGHT = 1440, 810


def area_light(name, location, target, size, energy, color=(1, 1, 1), shape="RECTANGLE"):
    data = bpy.data.lights.new(name, "AREA")
    data.shape = shape
    data.size = size[0]
    data.size_y = size[1]
    data.energy = energy
    data.color = color
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = location
    direction = Vector(target) - Vector(location)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return obj


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--samples", type=int, default=384)
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--out", default=os.path.join(cs.OUT, "studio_card.png"))
    ap.add_argument("--world", type=float, default=0.42, help="room light multiplier")
    ap.add_argument("--key", type=float, default=1.0, help="softbox multiplier")
    ap.add_argument("--tilt", type=float, default=-50.0, help="degrees the top leans away")
    ap.add_argument("--roll", type=float, default=-16.0, help="in-plane rotation, degrees")
    ap.add_argument("--yaw", type=float, default=8.0, help="turn about the vertical, degrees")
    ap.add_argument("--fill", type=float, default=0.86, help="share of the frame height the card spans")
    ap.add_argument("--webp", action="store_true")
    args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])

    scene = cs.reset_scene()
    scene.render.resolution_x = WIDTH
    scene.render.resolution_y = HEIGHT
    scene.render.resolution_percentage = int(100 * args.scale)
    scene.cycles.samples = args.samples

    # the same card as in the photograph, with its light inlay barely on
    finish = dict(cs.FINISH_MIDNIGHT)
    finish.update(
        base=(0.020, 0.036, 0.105),
        metallic=0.92,
        roughness=0.19,
        coat=0.5,
        coat_roughness=0.05,
        bow=(0.26, 0.30),
        rim_light=0.9,
        rim_floor=0.10,
        chip_metallic=0.72,
    )
    card = cs.build_card(finish)
    # The card starts in the XY plane facing +Z (the camera). It is rolled in
    # its own plane first, then laid back and turned: a card floating at a
    # reading angle, so its wide footprint suits the 16:9 frame.
    card.rotation_euler = Euler(
        (math.radians(args.tilt), math.radians(args.yaw), math.radians(args.roll)), "ZXY"
    )

    cam_data = bpy.data.cameras.new("Camera")
    cam_data.lens = 85
    cam_data.sensor_fit = "VERTICAL"
    cam_data.sensor_height = 36
    cam = bpy.data.objects.new("Camera", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam.location = (0.0, 0.0, 3.0)
    cam.rotation_euler = (0.0, 0.0, 0.0)

    # Frame the card: pick the distance that makes it span `fill` of the frame
    # height, then centre its silhouette with lens shift (the camera stays
    # square-on, so the perspective of the card itself does not change).
    def silhouette():
        bpy.context.view_layer.update()
        pts = [cs.project(scene, cam, p) for p in cs.card_front_corners(card)]
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        return min(xs), max(xs), min(ys), max(ys)

    for _ in range(6):
        x0, x1, y0, y1 = silhouette()
        cam.location.z *= ((y1 - y0) / HEIGHT) / args.fill
    for _ in range(4):
        x0, x1, y0, y1 = silhouette()
        cam_data.shift_x += ((x0 + x1) / 2 - WIDTH / 2) / max(WIDTH, HEIGHT)
        cam_data.shift_y -= ((y0 + y1) / 2 - HEIGHT / 2) / max(WIDTH, HEIGHT)

    # --- world: a dark studio. What a dark glossy card shows is what it
    # mirrors, so the room is a soft ramp of light from upper left to lower right.
    world = bpy.data.worlds.new("Studio")
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    dot = nt.nodes.new("ShaderNodeVectorMath")
    dot.operation = "DOT_PRODUCT"
    bpy.context.view_layer.update()
    normal = (card.matrix_world.to_3x3() @ Vector((0.0, 0.0, 1.0))).normalized()
    view = Vector((0.0, 0.0, 1.0))
    mirrored = (2.0 * normal.dot(view) * normal - view).normalized()   # what the face centre mirrors
    lit_from = (mirrored + 0.62 * Vector((-0.75, 0.66, 0.0))).normalized()
    dot.inputs[1].default_value = lit_from
    nt.links.new(coord.outputs["Generated"], dot.inputs[0])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "EASE"
    ramp.color_ramp.elements[0].position = 0.45
    ramp.color_ramp.elements[0].color = (0.004, 0.006, 0.012, 1.0)
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = (0.42, 0.50, 0.70, 1.0)
    mid = ramp.color_ramp.elements.new(0.82)
    mid.color = (0.085, 0.11, 0.18, 1.0)
    nt.links.new(dot.outputs["Value"], ramp.inputs["Fac"])

    # a soft band of light across the room: the long diagonal sheen on the face
    dot2 = nt.nodes.new("ShaderNodeVectorMath")
    dot2.operation = "DOT_PRODUCT"
    dot2.inputs[1].default_value = (mirrored + 0.55 * Vector((0.66, -0.75, 0.0))).normalized()
    nt.links.new(coord.outputs["Generated"], dot2.inputs[0])
    band = nt.nodes.new("ShaderNodeValToRGB")
    band.color_ramp.interpolation = "EASE"
    band.color_ramp.elements[0].position = 0.84
    band.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
    band.color_ramp.elements[1].position = 0.975
    band.color_ramp.elements[1].color = (0.0, 0.0, 0.0, 1.0)
    peak = band.color_ramp.elements.new(0.915)
    peak.color = (0.55, 0.64, 0.95, 1.0)
    nt.links.new(dot2.outputs["Value"], band.inputs["Fac"])
    room = nt.nodes.new("ShaderNodeMixRGB")
    room.blend_type = "ADD"
    room.inputs["Fac"].default_value = 1.0
    nt.links.new(ramp.outputs["Color"], room.inputs["Color1"])
    nt.links.new(band.outputs["Color"], room.inputs["Color2"])
    nt.links.new(room.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = args.world
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    scene.world = world

    # --- lights. The key only feeds the matte parts of the artwork (it is
    # hidden from reflections, so it never stamps a hard shape on the face);
    # the kickers sit behind the card and draw its chamfer and inlay.
    key = area_light("Key", (-1.2, 1.6, 2.6), (0.0, 0.1, 0.0), (2.6, 2.0), 46 * args.key)
    key.visible_glossy = False
    area_light("BlueKick", (2.3, 0.8, -0.3), (0.0, 0.0, 0.0), (0.5, 2.6), 160, color=(0.12, 0.40, 1.0))
    # laid back, the face mirrors the space above the card: keep this strip
    # out of the face (it only grazes the edges)
    rim_top = area_light("RimTop", (-0.5, 2.7, -0.6), (0.0, 0.0, 0.0), (2.4, 0.4), 60, color=(0.85, 0.92, 1.0))
    rim_top.visible_glossy = False

    scene.render.filepath = args.out
    bpy.ops.render.render(write_still=True)

    bpy.context.view_layer.update()
    corners = [cs.project(scene, cam, p) for p in cs.card_front_corners(card)]
    print("STUDIO_CORNERS", [[round(x, 2), round(y, 2)] for x, y in corners])
    print("wrote", args.out)

    if args.webp:
        from PIL import Image

        asset = os.path.join(cs.HERE, "..", "src", "assets", "revolut-card.webp")
        Image.open(args.out).convert("RGBA").save(asset, "WEBP", quality=92, method=6)
        print("wrote", asset, os.path.getsize(asset) // 1024, "KB")


if __name__ == "__main__":
    main()
