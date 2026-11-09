{"title": "Vercel now blocks bad npm packages; the npm in every Node LTS still runs install scripts", "title_th": "Vercel บล็อกแพ็กเกจ npm อันตรายตอน build แล้ว แต่ npm ที่มากับ Node ทุกรุ่น LTS ยังรันสคริปต์ติดตั้งของแพ็กเกจอยู่", "date": "2026-11-03", "beat": "last-mile",
 "dek": "Since 2 November Vercel fails a build that contains a blocklisted npm version. The first install happens earlier, on a laptop or in an AI tool, with an npm that runs install scripts. Two .npmrc lines, tested 3 November 2026.",
 "dek_th": "ตั้งแต่ 2 พฤศจิกายน Vercel จะหยุด build ทันทีถ้าเจอแพ็กเกจ npm รุ่นที่อยู่ในรายการบล็อก แต่การติดตั้งครั้งแรกเกิดขึ้นก่อนหน้านั้น บนโน้ตบุ๊กหรือในเครื่องมือ AI ซึ่งใช้ npm ที่ยังรันสคริปต์ติดตั้งให้ทุกแพ็กเกจ แก้ได้ด้วยสองบรรทัดใน .npmrc ทดสอบเมื่อ 3 พฤศจิกายน 2569",
 "cards": ["vibe", "web-care", "app-test"],
 "card": {"big": "Your laptop installs before Vercel checks", "sub": "Two .npmrc lines, tested on npm 10, 11, 12"},
 "sources": [
  {"t": "Blocking malicious npm packages before and during installation - Vercel", "u": "https://vercel.com/changelog/blocking-malicious-npm-packages-before-and-during-installation"},
  {"t": "npm/cli CHANGELOG.md", "u": "https://github.com/npm/cli/blob/latest/CHANGELOG.md"},
  {"t": "config | npm Docs", "u": "https://docs.npmjs.com/cli/v11/using-npm/config"},
  {"t": "Node.js Releases", "u": "https://nodejs.org/en/about/previous-releases"},
  {"t": "Dependency Resolution | pnpm", "u": "https://pnpm.io/settings/dependency-resolution"},
  {"t": "Build Settings | pnpm", "u": "https://pnpm.io/settings/build"}
 ]}
---
On 2 November 2026 Vercel started checking every new build on every plan against a list of npm package versions it has marked as malware or dangerously flawed [1]. It reads the lockfile before installing, including packages restored from the build cache, and blocks downloads of listed versions during the install. A match fails the deployment and names the package and version [1]. npm is the public registry of JavaScript packages that almost every web app pulls in by the hundred.

This protects the build. It does not reach the machine where the package first arrives. An app built with Cursor, Lovable, Bolt or Claude Code gets its packages installed on the founder's laptop or in the tool's own environment, and a malicious package does its damage at that moment: its **install script** runs. An install script is a program a package asks to run on your computer when it is installed, before your app ever starts. It runs with your user's access to files, saved keys and tokens.

## The npm that ships with Node runs install scripts by default

npm 12.0.0, released 8 July 2026, blocks dependency install scripts unless the project approves them [2]. No long-term-support (LTS) release of Node.js ships npm 12. Node's release table, read today [4]:

| Node.js line | Newest release | Bundled npm | Runs install scripts by default | Knows `min-release-age` |
|---|---|---|---|---|
| 26 (LTS) | 26.13.0, 28 October 2026 | 11.20.0 | yes | yes |
| 24 (LTS) | 24.22.2, 27 October 2026 | 11.19.1 | yes | yes |
| 22 (LTS) | 22.23.4, 20 October 2026 | 10.9.9 | yes | no |

`min-release-age` arrived in npm 11.10.0 on 11 February 2026 [2]. It makes npm install only versions published more than a given number of days ago [3]. A delay gives the registry and lists such as Vercel's time to catch a poisoned release before it reaches your machine. Vercel's own page says new rules typically reach builds "within minutes" [1]; a version nobody has listed yet installs everywhere, Vercel included.

## Tested: what each npm does with a script-carrying package

We built a test package whose install script writes a file, then installed it into an empty project with each npm. Measured 3 November 2026 on macOS, Node.js 24.7.0. npm 12.2.1 printed a warning that it supports Node 24 from 24.15.0; it ran.

| npm | Settings | Script ran | Result |
|---|---|---|---|
| 10.9.9 (Node 22) | default | yes | no warning |
| 11.19.1 (Node 24) | default | yes | a warning that the package is not approved, then runs it |
| 11.19.1 | `--ignore-scripts` | no | installs |
| 11.19.1 | `strict-allow-scripts=true` | no | install stops with `ESTRICTALLOWSCRIPTS` |
| 12.2.1 | default | no | a warning that the script was blocked |
| pnpm 12.16.1 | default | no | install stops with `ERR_PNPM_IGNORED_BUILDS` |

The same day `next` had a release 13 hours old, 16.4.4, and one from 23 October, 16.4.3. Installing `next` with no version:

| Package manager | Setting | Version installed |
|---|---|---|
| npm 11.19.1 | none | 16.4.4 |
| npm 11.19.1 | `min-release-age=7` | 16.4.3 |
| npm 10.9.9 | `min-release-age=7` in `.npmrc` | 16.4.4: setting ignored |
| pnpm 12.16.1 | none (default 1,440 minutes) | 16.4.3 |

pnpm, the other common package manager, already waits a day and blocks unapproved build scripts by default [5][6]. For a project on npm, two lines bring npm 11 most of the way there.

## The fix: two lines in .npmrc, and npm 11.10 or newer

Create a file named `.npmrc` in the project's root folder, next to `package.json`:

```ini
min-release-age=7
strict-allow-scripts=true
```

Then check the npm version, and upgrade if it is below 11.10:

```bash
npm --version
npm install -g npm@11
```

`.npmrc` travels with the repository, so the laptop, the AI tool's environment and any build server that runs npm 11.10 or newer read the same rules. npm 10 ignores both lines and prints "Unknown project config"; that warning means the machine still runs every script.

With the strict setting on, the first install that meets a package with an install script stops and lists it. Some packages need theirs: `esbuild`, `sharp` and database drivers fetch or compile a binary for the computer they land on. The approval takes four commands, tested on npm 11.19.1 with `esbuild` and `next`:

```bash
npm install --ignore-scripts
npm install-scripts approve esbuild
npm rebuild
npm ci
```

The approval lands in `package.json` pinned to the exact version, `"allowScripts": {"esbuild@0.28.2": true}` [3]. We changed the pin to 0.28.1 and ran `npm ci` again: it stopped with `ESTRICTALLOWSCRIPTS`. A new version of a package needs a new yes, so a hijacked release cannot run its script on the strength of an old one. In our test `next` 16.4.3 installed with no approval at all, since it has no install script of its own.

## Three cases this does not cover

- **Urgent security fixes.** A seven-day delay also holds back a patch published today. Install that one by hand with an exact version, `npm install next@16.4.4`, or list the package in `min-release-age-exclude` [2].
- **Malicious code that runs later.** Blocking install scripts stops the attack at install time. A package that carries its payload in the code your app imports still runs when the app runs; the delay and lists like Vercel's are the defence there [1].
- **Tools that bring their own npm.** An AI tool's environment uses whatever npm its maker installed. `npm --version` in the tool's terminal says which; below 11.10, the `.npmrc` lines are ignored there.
