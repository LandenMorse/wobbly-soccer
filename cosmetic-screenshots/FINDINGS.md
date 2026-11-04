# Cosmetic screenshot review

Source: `wobbly-soccer.html` at `origin/new-cosmetics` (08b76e4).
Method: headless Chromium (Playwright). Each cosmetic was drawn with the game's own `drawPlayer` / `drawBall` at menu-preview scale, one at a time, with everything else set to its None/default option. No JS errors on load.

Coverage: 18 skins, 17 hats, 6 boots, 6 accessories, 15 ball skins (62 total). Contact sheets: `sheet_skins.png`, `sheet_hats.png`, `sheet_boots.png`, `sheet_accs.png`, `sheet_balls.png`. Individual tiles are in the subfolders.

## Flagged

1. **Hat: Headband (`hat_headband`) is nearly invisible.** It uses the same cyan as the default body, so it reads as a bump on the head rather than a band. Suggest a contrasting colour or an outline.
2. **Boots: Cleats (`cleats`) have low contrast.** Dark grey shoes sit on the dark background and are hard to see. Suggest a lighter grey or an outline.
3. **Menu P2 "gold ring" with Hat = None is not a cosmetic bug.** It is the charge meter arc (`drawPlayer`, drawn when `chargeAmount > 5`). The menu preview fakes a charge cycle, with P2 offset in phase, so the arc appears on P2 while P1 is out of phase. It looks like a Halo because it is gold and floats above the head. Suggest hiding the charge arc in the menu preview, or tinting it differently so it does not read as a hat. See `extra/p2_hat_none_0.png` and `extra/p2_hat_none_2.png`.

## Checked, looks correct

- All 18 skins render with no clipping, including the new jersey set (Hoops, Brazil, Pinstripe, Sash, Checker, Retro, Tuxedo, Hawaiian, Rainbow, Camo).
- All hats render and sit on the head. Cap, Party, Viking, Top Hat, Halo, Beanie, Fedora, Bunny, Wizard, Pirate, Propeller, Flower Crown, Santa and Devil Horns all look right.
- Sneakers, Rain Boots, Rocket Boots and Gold Boots render at the feet.
- All 6 accessories render on the face or body.
- All 15 ball skins render. Ball goal confetti and trails were not captured (see limits).

## Limits

- Captures are single frames at menu-preview scale, not full arena play.
- Animated parts (Galaxy stars, Magma glow, Rainbow sweep) were captured at one time value only.
- Ball goal confetti and trail particles were not captured.
- Clipping inside the arena (ceiling, goal posts, screen edge) was not tested.
