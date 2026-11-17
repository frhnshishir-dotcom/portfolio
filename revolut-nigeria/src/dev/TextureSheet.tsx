import { CardFace, type CardFaceLayer } from '../components/CardFace/CardFace';

/**
 * Dev-only page used by tools/render-face-textures.mjs.
 * Draws one artwork group of the card face at 1:1 card units on a transparent
 * page so it can be captured as a texture for the 3D render.
 */
export function TextureSheet({ layer }: { layer: string }) {
  const layers = (layer === 'all' ? ['rim', 'logo', 'chip', 'details'] : [layer]) as CardFaceLayer[];
  return (
    <div id="texture-sheet" style={{ position: 'fixed', left: 0, top: 0 }}>
      <CardFace layers={layers} variant="print" />
    </div>
  );
}
