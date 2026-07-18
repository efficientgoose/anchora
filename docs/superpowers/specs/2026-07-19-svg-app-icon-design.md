# SVG app icon design

## Goal

Use the supplied `logo.svg` for Anchora's browser favicon and in-app brand icon so those surfaces remain sharp at different display sizes.

## Asset strategy

- Store one canonical web SVG as `public/anchora-logo.svg`.
- Point `BrandIcon` at `/anchora-logo.svg` without changing its current dimensions, crop, or layout behavior.
- Declare `/anchora-logo.svg` as the browser favicon in the root metadata.
- Remove the file-based PNG favicon so Next.js does not emit a competing PNG icon declaration.
- Keep the PNG Apple touch icon because iOS touch-icon support expects a raster asset.
- Keep the public PNG used by authentication emails because SVG rendering is unreliable across email clients.

## Scope and safety

The SVG artwork itself will not be redesigned or rewritten. The change will not alter authentication logic, email copy, layouts, sizing, or colors. Existing unrelated worktree changes will be preserved.

## Verification

- Confirm the browser metadata points to `/anchora-logo.svg` and no longer advertises the PNG favicon.
- Confirm `BrandIcon` renders `/anchora-logo.svg`.
- Confirm the Apple touch icon and email template still use their PNG assets.
- Run the existing lint and type-check commands. No test classes or test methods will be created.
