# Android PR preview builds (test on your phone)

Every pull request opened from a Claude Code **cloud session** (a `claude/*`
branch) builds an installable Android preview APK on
[EAS Build](https://docs.expo.dev/build/introduction/) and posts an install
link + QR code as a PR comment. Open that link on your Android phone, tap
**Install**, and you're testing the branch on a real device — no Play Store, no
cable.

The pipeline is `.github/workflows/frontend-pr-preview.yml` using the `preview`
profile in `eas.json` (internal distribution, `buildType: apk`).

## One-time setup

1. **Create a free Expo account** at <https://expo.dev> (or sign in to an
   existing one).

2. **Link this app to an EAS project.** From `apps/frontend`, run once locally:

   ```bash
   npx eas-cli login
   npx eas-cli init
   ```

   `eas init` writes `expo.extra.eas.projectId` (and `owner`) into `app.json`.
   Commit that change so CI can build non-interactively.

3. **Create an Expo access token** at
   <https://expo.dev/settings/access-tokens> and add it to the repo as a secret
   named **`EXPO_TOKEN`**
   (Settings → Secrets and variables → Actions → New repository secret).

That's it. The next cloud-session PR will build automatically and comment the
install link.

## Notes

- **Only `claude/*` PRs build.** The job is guarded by
  `if: startsWith(github.head_ref, 'claude/')` so unrelated PRs don't spend EAS
  build quota. To build any PR to `main`, remove that `if` line.
- **Build minutes.** EAS free tier includes a limited number of Android builds
  per month; internal preview builds count against it.
- **Trigger manually / other branches.** You can also build any branch from a
  machine with the Expo CLI:

  ```bash
  cd apps/frontend
  npx eas-cli build --profile preview --platform android
  ```

- **iOS.** The same `preview` profile works for iOS, but internal iOS
  distribution requires registering the device's UDID with an Apple Developer
  account (`eas device:create`). This workflow builds Android only.
