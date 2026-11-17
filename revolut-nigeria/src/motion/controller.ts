import { CARD_FACE } from '../lib/cardFace';
import {
  lerp,
  lerpPoint,
  lerpQuad,
  quadBounds,
  quadHeight,
  quadMatrix3d,
  quadMaxSide,
  rectQuad,
  transformQuad,
  type Point,
  type Quad,
} from '../lib/quad';
import { CARD_ASPECT, CARD_CENTER, CARD_CORNERS } from '../lib/scene';
import { restAnchor, solveStage, type StageLayout, type Viewport } from '../lib/stage';

/**
 * Everything the camera and the portal can do, as five numbers.
 * Timelines tween these; `render()` turns them into transforms.
 */
export type SceneState = {
  /** Extra scale while the photograph settles during the intro (1 = at rest). */
  intro: number;
  /** Camera push-in: multiplies the rest scale, pivoting on the card. */
  zoom: number;
  /** 0 = card at its rest anchor, 1 = card centred in the viewport. */
  focus: number;
  /** 0 = card as photographed, 1 = card turned to face the visitor. */
  turn: number;
  /** 0 = card-sized, 1 = large enough to cover the viewport. */
  expand: number;
};

export type SceneElements = {
  /** The pinned viewport-sized element; its box is the viewport. */
  root: HTMLElement;
  /** The photograph's own coordinate space (IMAGE.width x IMAGE.height). */
  stage: HTMLElement;
  /** Elements of CARD_FACE size that ride on the card's four corners. */
  planes: readonly HTMLElement[];
};

export type SceneFrame = {
  viewport: Viewport;
  layout: StageLayout;
  /** Screen-space corners the planes are mapped onto this frame. */
  quad: Quad;
  /** True once the portal covers the whole viewport. */
  covered: boolean;
};

export type SceneController = {
  readonly state: SceneState;
  /** Latest computed frame. */
  readonly frame: SceneFrame;
  /** Screen-space height of the photographed card at rest. */
  restCardHeight(): number;
  /** Re-measure the viewport, then render. */
  resize(): void;
  /** Write transforms for the current state. */
  render(): void;
  destroy(): void;
};

/** How much larger than the viewport the portal ends, so its round corners clear the screen. */
const COVER_BLEED = 1.16;

export function createSceneController(elements: SceneElements): SceneController {
  const state: SceneState = { intro: 1, zoom: 1, focus: 0, turn: 0, expand: 0 };

  let viewport: Viewport = { width: 1, height: 1 };
  let layout: StageLayout = solveStage(viewport);
  let frame: SceneFrame = { viewport, layout, quad: CARD_CORNERS, covered: false };

  function measure() {
    viewport = {
      width: Math.max(elements.root.clientWidth, 1),
      height: Math.max(elements.root.clientHeight, 1),
    };
    layout = solveStage(viewport, restAnchor(viewport));

    // Publish the resting card's rectangle so the copy can be laid out around it.
    const rest = quadBounds(transformQuad(CARD_CORNERS, layout.scale, layout.x, layout.y));
    const style = elements.root.style;
    style.setProperty('--card-top', `${rest.top.toFixed(1)}px`);
    style.setProperty('--card-bottom', `${rest.bottom.toFixed(1)}px`);
    style.setProperty('--card-left', `${rest.left.toFixed(1)}px`);
    style.setProperty('--card-right', `${rest.right.toFixed(1)}px`);
  }

  function render() {
    const { width, height } = viewport;
    const [cx, cy] = CARD_CENTER;

    // --- camera: scale about the card, and carry the card towards the centre
    const scale = layout.scale * state.zoom * state.intro;
    const centre: Point = lerpPoint(layout.anchor, [width / 2, height / 2], state.focus);
    const tx = centre[0] - cx * scale;
    const ty = centre[1] - cy * scale;
    elements.stage.style.transform = `translate3d(${tx.toFixed(3)}px,${ty.toFixed(3)}px,0) scale(${scale.toFixed(6)})`;

    // --- portal: from the photographed quad, to a card facing us, to the viewport.
    // Facing, the card is as tall as the photographed card's longer side, so at
    // every step of the turn it still covers the photographed card behind it.
    const photographed = transformQuad(CARD_CORNERS, scale, tx, ty);
    const coverHeight = Math.max(height, width / CARD_ASPECT) * COVER_BLEED;
    const facingHeight = lerp(quadMaxSide(photographed), coverHeight, state.expand);
    const facing = rectQuad(centre[0], centre[1], facingHeight * CARD_ASPECT, facingHeight);
    const quad = state.turn === 0 && state.expand === 0 ? photographed : lerpQuad(photographed, facing, state.turn);

    const matrix = quadMatrix3d(CARD_FACE.width, CARD_FACE.height, quad);
    for (const plane of elements.planes) plane.style.transform = matrix;

    const covered =
      quad[0][0] <= 0 &&
      quad[0][1] <= 0 &&
      quad[1][0] >= width &&
      quad[1][1] <= 0 &&
      quad[2][0] >= width &&
      quad[2][1] >= height &&
      quad[3][0] <= 0 &&
      quad[3][1] >= height;

    frame = { viewport, layout, quad, covered };
  }

  const observer = new ResizeObserver(() => {
    measure();
    render();
  });
  observer.observe(elements.root);

  measure();
  render();

  return {
    state,
    get frame() {
      return frame;
    },
    restCardHeight: () => quadHeight(transformQuad(CARD_CORNERS, layout.scale, layout.x, layout.y)),
    resize() {
      measure();
      render();
    },
    render,
    destroy() {
      observer.disconnect();
    },
  };
}
