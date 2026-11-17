"""Hero card: rendered to sit inside the Lagos photograph.

    python tools/render_hero.py --plate tools/out/plate.png [--samples 256]

The camera reproduces the photograph's own geometry (level camera, horizon row,
focal length), so a card standing on the water plane is in true perspective
with the bridge behind it. Passes written to tools/out/:

    hero_card.png         beauty, premultiplied over transparent
    hero_reflection.png   the same card mirrored in the water plane
    hero_front_matte.png  front face only, white on black (corner measurement)
    hero_rim.png          light inlay only, white on black (bloom source)
    hero_camera.json      the camera model and the analytic corner projection
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import card_scene as cs  # noqa: E402

WIDTH, HEIGHT = 4096, 2640

# --- the photograph's camera, estimated from the plate --------------------
HORIZON_Y = 1836.0   # image row of the horizon (eye level), pixels from the top
FOCAL_PX = 5000.0    # focal length in pixels (about 44 mm on a 36 mm sensor)
CAMERA_HEIGHT = 2.5  # metres above the water

# --- where the card stands, expressed as what we want to see ---------------
BASE_Y = 2016.0      # image row where the card meets the water, at its axis
CARD_PIXELS = 1049.0 # image height of the card at its axis
CARD_X = 2055.0      # image column of the card's axis; puts the face's centre on x = 2048
YAW_DEG = 20.0       # the left edge swings towards the camera

# --- light, read off the photograph: low warm sun from behind-left ---------
SUN_AZIMUTH_DEG = 142.0   # measured from the view direction, towards the left
SUN_ELEVATION_DEG = 17.0


def srgb_to_linear(c):
    c = np.asarray(c, dtype=np.float32)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def build_environment(plate_path, width=2048, height=1024):
    """An equirectangular sky built from the photograph itself.

    Ahead of the camera it is the photograph. Behind the camera, which is what
    the card's face actually mirrors, there is no data, so the photograph is
    mirrored and stretched there and warmed towards the sun: the same sky, the
    same water, the same kind of skyline.
    """
    from PIL import Image

    plate = Image.open(plate_path).convert("RGB")
    small = plate.resize((1024, 660), Image.LANCZOS)
    p = srgb_to_linear(np.asarray(small, dtype=np.float32) / 255.0)
    ph, pw, _ = p.shape
    scale = pw / WIDTH
    f = FOCAL_PX * scale
    horizon = HORIZON_Y * scale

    az = (np.arange(width) + 0.5) / width * 2 * np.pi - np.pi      # -pi..pi, 0 = view direction
    el = np.pi / 2 - (np.arange(height) + 0.5) / height * np.pi    # +pi/2 (up) .. -pi/2
    az_g, el_g = np.meshgrid(az, el)

    # elevation -> plate row (for a column straight ahead), clamped to the plate
    row_of_el = np.clip(horizon - np.tan(np.clip(el, -1.2, 1.2)) * f, 0, ph - 1)
    row_mean = p.mean(axis=1)                                       # (ph, 3)
    idx = row_of_el.astype(int)
    gradient = row_mean[idx]                                        # (height, 3)
    # above the top of the plate the sky deepens a little towards the zenith
    top_el = math.atan(horizon / f)
    fade = np.clip((el - top_el) / (np.pi / 2 - top_el), 0, 1)[:, None]
    zenith = row_mean[:8].mean(axis=0) * np.array([0.62, 0.72, 0.95], dtype=np.float32)
    gradient = gradient * (1 - fade) + zenith * fade
    env = np.repeat(gradient[:, None, :], width, axis=1).astype(np.float32)

    def paste(center_az, stretch, mirror, strength):
        rel = (az_g - center_az + np.pi) % (2 * np.pi) - np.pi
        rel = rel / stretch
        inside = np.abs(rel) < math.atan((pw / 2) / f)
        x = np.tan(np.clip(rel, -1.3, 1.3)) * f
        if mirror:
            x = -x
        col = pw / 2 + x
        row = horizon - np.tan(np.clip(el_g, -1.2, 1.2)) * f * np.sqrt(1 + (x / f) ** 2)
        ok = inside & (col >= 0) & (col < pw - 1) & (row >= 0) & (row < ph - 1)
        ci = np.clip(col, 0, pw - 1).astype(int)
        ri = np.clip(row, 0, ph - 1).astype(int)
        sample = p[ri, ci]
        edge = np.clip(1 - np.abs(rel) / math.atan((pw / 2) / f), 0, 1) ** 0.6
        weight = (ok * edge * strength)[..., None]
        return sample, weight

    sample, weight = paste(0.0, 1.0, False, 1.0)                    # ahead: the photograph
    env = env * (1 - weight) + sample * weight
    sample, weight = paste(np.pi * 0.86, 2.6, True, 0.9)            # behind: mirrored, stretched
    env = env * (1 - weight) + sample * weight

    # warm, brighter sky around the sun's azimuth, close to the horizon
    sun_az = math.radians(SUN_AZIMUTH_DEG)
    d_az = (az_g + sun_az + np.pi) % (2 * np.pi) - np.pi            # the sun is to the left: -azimuth
    glow = np.exp(-(d_az / 1.05) ** 2) * np.exp(-((el_g - 0.14) / 0.40) ** 2)
    glow = glow[..., None] * (el_g > -0.02)[..., None]
    env = env * (1 + 1.8 * glow) + glow * np.array([0.62, 0.33, 0.12], dtype=np.float32)

    rgba = np.concatenate([env, np.ones((height, width, 1), np.float32)], axis=2)
    img = bpy.data.images.new("LagosSky", width, height, alpha=False, float_buffer=True)
    flat = np.ascontiguousarray(rgba[::-1], dtype=np.float32).ravel()  # Blender rows run bottom-up
    img.pixels.foreach_set(flat)
    img.pack()
    return img


def setup_world(scene, env_image, strength):
    world = bpy.data.worlds.new("Lagos")
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    tex = nt.nodes.new("ShaderNodeTexEnvironment")
    tex.image = env_image
    mapping = nt.nodes.new("ShaderNodeMapping")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    # Equirect u = 0.5 looks down -Y in Blender; our azimuth 0 is the view
    # direction +Y, so turn the map half a revolution about Z.
    mapping.inputs["Rotation"].default_value = (0.0, 0.0, math.pi)
    nt.links.new(coord.outputs["Generated"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], tex.inputs["Vector"])
    nt.links.new(tex.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    scene.world = world


def render(scene, path, samples):
    scene.cycles.samples = samples
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("wrote", path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plate", default=os.path.join(cs.OUT, "plate.png"))
    ap.add_argument("--samples", type=int, default=256)
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--only", default="", help="comma list: beauty,reflection,matte,rim")
    args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])
    only = set(filter(None, args.only.split(",")))

    scene = cs.reset_scene()
    scene.render.resolution_x = WIDTH
    scene.render.resolution_y = HEIGHT
    scene.render.resolution_percentage = int(100 * args.scale)

    # ---- camera: level, so verticals stay vertical; the horizon is placed by lens shift
    cam_data = bpy.data.cameras.new("PlateCamera")
    cam_data.sensor_fit = "HORIZONTAL"
    cam_data.sensor_width = 36.0
    cam_data.lens = 36.0 * FOCAL_PX / WIDTH
    cam_data.shift_x = 0.0
    cam_data.shift_y = (HORIZON_Y - HEIGHT / 2) / WIDTH
    cam_data.clip_start = 0.1
    cam_data.clip_end = 5000
    cam = bpy.data.objects.new("PlateCamera", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam.location = (0.0, 0.0, CAMERA_HEIGHT)
    cam.rotation_euler = (math.radians(90), 0.0, 0.0)   # looking along +Y, Z up

    # ---- card: distance and size follow from where its base and top should appear
    distance = FOCAL_PX * CAMERA_HEIGHT / (BASE_Y - HORIZON_Y)
    card_height = CARD_PIXELS * distance / FOCAL_PX
    lateral = (CARD_X - WIDTH / 2) * distance / FOCAL_PX

    finish = dict(cs.FINISH_MIDNIGHT)
    finish.update(
        base=(0.020, 0.036, 0.105),
        metallic=0.92,
        roughness=0.17,
        coat=0.5,
        coat_roughness=0.05,
        bow=(0.16, 0.24),
        rim_light=1.7,
        rim_floor=0.04,
    )
    card = cs.build_card(finish)
    card.scale = (card_height, card_height, card_height)
    # stand it up (local Y -> world Z, front towards -Y, the camera), then yaw
    card.rotation_euler = (math.radians(90), 0.0, math.radians(YAW_DEG))
    card.location = (lateral, distance, card_height / 2)

    # ---- light
    env = build_environment(args.plate)
    setup_world(scene, env, strength=1.35)
    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 3.4
    sun_data.color = (1.0, 0.72, 0.46)
    sun_data.angle = math.radians(2.0)
    sun = bpy.data.objects.new("Sun", sun_data)
    scene.collection.objects.link(sun)
    az, el = math.radians(SUN_AZIMUTH_DEG), math.radians(SUN_ELEVATION_DEG)
    to_sun = Vector((-math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), math.sin(el)))
    sun.rotation_euler = (-to_sun).to_track_quat("-Z", "Y").to_euler()

    bpy.context.view_layer.update()
    corners = [cs.project(scene, cam, p) for p in cs.card_front_corners(card)]
    horizon_check = cs.project(scene, cam, Vector((0.0, 1.0e6, CAMERA_HEIGHT)))
    meta = {
        "image": [WIDTH, HEIGHT],
        "horizon_y": HORIZON_Y,
        "horizon_check_y": round(horizon_check[1], 3),
        "focal_px": FOCAL_PX,
        "camera_height_m": CAMERA_HEIGHT,
        "card_distance_m": round(distance, 3),
        "card_height_m": round(card_height, 3),
        "yaw_deg": YAW_DEG,
        "analytic_corners": [[round(x, 3), round(y, 3)] for x, y in corners],
    }
    with open(os.path.join(cs.OUT, "hero_camera.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    print("HERO", json.dumps(meta))

    def want(name):
        return not only or name in only

    if want("beauty"):
        render(scene, os.path.join(cs.OUT, "hero_card.png"), args.samples)

    if want("reflection"):
        # mirror in the water plane z = 0
        card.scale = (card_height, card_height, card_height)
        mirror = bpy.data.objects.new("Mirror", None)
        scene.collection.objects.link(mirror)
        card.parent = mirror
        mirror.scale = (1.0, 1.0, -1.0)
        render(scene, os.path.join(cs.OUT, "hero_reflection.png"), max(48, args.samples // 3))
        mirror.scale = (1.0, 1.0, 1.0)

    # ---- data passes: no lighting, no denoising, plain black background
    scene.cycles.use_denoising = False
    scene.render.film_transparent = False
    black_world = bpy.data.worlds.new("Black")
    black_world.use_nodes = True
    black_world.node_tree.nodes["Background"].inputs["Color"].default_value = (0, 0, 0, 1)
    scene.world = black_world
    sun.hide_render = True
    scene.render.image_settings.color_mode = "RGB"

    if want("matte"):
        front = cs.make_front_matte_material()
        cs.override_materials(card, front, front)
        render(scene, os.path.join(cs.OUT, "hero_front_matte.png"), 96)
    if want("rim"):
        cs.override_materials(card, cs.make_rim_pass_material(), cs.make_matte_material(False))
        render(scene, os.path.join(cs.OUT, "hero_rim.png"), 64)


if __name__ == "__main__":
    main()
