{"title": "n8n 2.48.4 and 2.47.7 stop blanking the execution page for a global credential", "title_th": "n8n 2.48.4 และ 2.47.7 เลิกปิดบังหน้าดูผลการรันของ workflow ที่ใช้ credential ส่วนกลาง", "date": "2026-11-19", "beat": "automation",
 "dek": "An execution that used a global credential came back as 'Data redacted' with no reveal button, even for the user who ran it. Fixed in 2.48.4 and 2.47.7 on 13 November, 2.49.0 on 17 November.",
 "dek_th": "การรัน workflow ที่ใช้ credential ส่วนกลางกลับขึ้นหน้า 'Data redacted' และไม่มีปุ่มเปิดดูให้กด แม้จะเป็นคนรันเอง แก้แล้วใน 2.48.4 และ 2.47.7 เมื่อ 13 พ.ย. และ 2.49.0 เมื่อ 17 พ.ย.",
 "cards": ["ai-automation"],
 "card": {"big": "Your n8n run went blank?", "sub": "What 2.48.4 and 2.47.7 bring back"},
 "sources": [
  {"t": "Release n8n@2.48.4 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/releases/tag/n8n%402.48.4"},
  {"t": "Release n8n@2.47.7 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/releases/tag/n8n%402.47.7"},
  {"t": "fix(core): Stop redacting executions that use global credentials · PR #43223 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/pull/43223"},
  {"t": "Backport #43223 to release-candidate/2.48.x · PR #43775 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/pull/43775"},
  {"t": "Backport #43223 to release-candidate/2.47.x · PR #43776 · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/pull/43776"},
  {"t": "Redact execution data · n8n Docs", "u": "https://docs.n8n.io/deploy/host-n8n/configure-n8n/security/redact-execution-data/"},
  {"t": "credentials-finder.service.ts · n8n-io/n8n", "u": "https://github.com/n8n-io/n8n/blob/master/packages/%40n8n/backend-services/src/credentials/credentials-finder.service.ts"},
  {"t": "Release notes · n8n Docs", "u": "https://docs.n8n.io/release-notes/"}
 ]}
---
n8n 2.48.4 and 2.47.7 shipped a single bug fix on 13 November 2026: "Stop redacting executions that use global credentials" [1][2]. The same change landed on master on 10 November [3]; the 2.49.0 pre-release carried it forward on 17 November [8]. One block removed in one file does the work [7].

## A redacted run that you cannot un-redact

n8n has an execution-data redaction feature. The docs set two triggers: a per-workflow toggle ("Redact production execution data" and "Redact manual execution data") and an instance-level policy a license can enforce [6]. When redaction fires, the execution page shows node names, status and timing, and replaces each payload with a "Data redacted" indicator and a shredder icon. A user with `execution:reveal` — instance owners, admins and project admins by default — can press **Reveal data**, confirm an audit warning, and read the payload for that session [6].

There is a second redaction path the docs do not describe: the credential check. When you view an execution, n8n also asks whether you can use every credential the workflow referenced. If you cannot, the payload is blanked and the reveal button is hidden. The PR puts the case plainly [3]:

> Redaction hides execution data from a viewer who cannot use a credential that the workflow references.

That check ignored the instance-wide `credential:use` scope of owners and admins, and it left out global credentials — the kind every user on the installation may use. An execution that touched a global credential came back blanked for every viewer, with no reveal button to recover it.

## The shape of the blank

The PR's integration test seeds a project with a credential marked `isGlobal: true`, runs a workflow that reads it, and views the execution as a plain member [3]. Before the fix: `redactionInfo` was `{reason: 'credential_inaccessible', canReveal: false}` — no payload, no reveal button. After: `redactionInfo` is `undefined`, and the JSON output appears as it did on the run itself. A second test covers the opposite case, a non-global credential the member cannot use: redacted as before, reveal still denied.

The changed file is `packages/@n8n/backend-services/src/credentials/credentials-finder.service.ts` [7]. The function at the centre is `findCredentialIdsWithScopeForUser`, called by three paths that answer "as if this user had no instance-wide `credential:use`": the redaction check, a team-project run check, and a publish check. The diff removes the enclosing `if (!options.ignoreGlobalOverride)` so the global-credentials lookup runs regardless of that option.

```diff
-        // Also include global credentials if scopes allow read-only access.
-        if (!options.ignoreGlobalOverride) {
-            if (this.hasGlobalReadOnlyAccess(scopes)) {
-                const globalIds = await this.credentialAccessRepository.findGlobalProjectCredentialIds(
-                    credentialIds,
-                    false,
-                );
-                for (const id of globalIds) result.add(id);
-            } else if (this.hasGlobalConnectAccess(scopes)) {
-                // ...connect access branch...
-            }
-        }
+        // Also include global credentials if scopes allow read-only access. Every user
+        // may use a global credential, so this applies even when the instance-wide
+        // override is ignored.
+        if (this.hasGlobalReadOnlyAccess(scopes)) {
+            const globalIds = await this.credentialAccessRepository.findGlobalProjectCredentialIds(
+                credentialIds,
+                false,
+            );
+            for (const id of globalIds) result.add(id);
+        } else if (this.hasGlobalConnectAccess(scopes)) {
+            // ...connect access branch...
+        }
```

Measured 19 November 2026 from GitHub's `/pulls/43223/files` endpoint: +18 and -17 lines in the finder, +27 and -1 in its unit test, +131 and -0 in a new integration test. One block removed; `ignoreGlobalOverride` no longer suppresses the global-credentials lookup.

## Which versions carry it

| Release line | Version | Date | PR |
|---|---|---|---|
| master | the merge on 10 Nov 2026 | 10 Nov | #43223 [3] |
| 2.48.x | 2.48.4 | 13 Nov | #43775 [4] |
| 2.47.x | 2.47.7 | 13 Nov | #43776 [5] |
| 2.49.x pre-release | 2.49.0 | 17 Nov | [8] |

2.48.5 (18 November) and the 2.49.1 beta (18 November) include the same fix with later patches on top [8].

## What a viewer sees after upgrading

An execution whose workflow used a global credential, viewed under the upgraded installation, shows its node payloads with no "Data redacted" indicator for viewers with read access to the workflow. An execution that used a credential the viewer cannot use is redacted as before, with the reveal button for admins. The fix narrows what the credential check covers; the per-workflow redaction toggles, the instance policy and the reveal audit trail do not change [6].

For a team running n8n in Docker, the upgrade path is `docker pull n8nio/n8n:2.48.4` (or `:2.47.7`) and a container restart. `GET /rest/settings` returns the running version in `versionCli`.
