{"title": "llama.cpp 1.0.0: 36 deprecated calls removed, --defrag-thold gone, FP8 KV cache on CUDA", "title_th": "llama.cpp 1.0.0: ตัดฟังก์ชันเก่า 36 ตัว ถอด --defrag-thold และเพิ่ม KV cache แบบ FP8 บน CUDA", "date": "2026-11-13", "beat": "models",
 "dek": "Out 13 November 2026, 10:20 UTC. Code on the old names stops compiling, a preset with defrag-thold stops the router, and -ctk f8_e4m3 halves the KV cache on NVIDIA GPUs. Homebrew still gives 0.9.0.",
 "dek_th": "ออกวันที่ 13 พฤศจิกายน 2569 เวลา 10:20 UTC โค้ดที่เรียกชื่อฟังก์ชันเก่าจะคอมไพล์ไม่ผ่าน พรีเซ็ตเซิร์ฟเวอร์ที่ยังมี defrag-thold จะทำให้ router ไม่สตาร์ต และ -ctk f8_e4m3 ลดขนาด KV cache ลงครึ่งหนึ่งบนการ์ด NVIDIA ส่วน Homebrew ยังให้เวอร์ชัน 0.9.0",
 "cards": ["ai-own", "ai-assistant"],
 "sources": [
  {"t": "Release v1.0.0 · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/releases/tag/v1.0.0"},
  {"t": "llama.cpp : bump version to 1.0.0 (#32190) · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/pull/32190"},
  {"t": "llama : prune (#30565) · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/pull/30565"},
  {"t": "include/llama.h at v0.9.0 · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/blob/v0.9.0/include/llama.h"},
  {"t": "include/llama.h at v1.0.0 · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/blob/v1.0.0/include/llama.h"},
  {"t": "docs: add migration guide for llama_batch (#32163) · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/pull/32163"},
  {"t": "llama-cpp-python · PyPI", "u": "https://pypi.org/project/llama-cpp-python/"},
  {"t": "vendor · abetlen/llama-cpp-python", "u": "https://github.com/abetlen/llama-cpp-python/tree/main/vendor"},
  {"t": "llama.cpp · Homebrew Formulae", "u": "https://formulae.brew.sh/formula/llama.cpp"},
  {"t": "Add FP8 KV-cache support (#28392) · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/pull/28392"},
  {"t": "CUDA: Add OCP FP8 support (#28413) · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/pull/28413"},
  {"t": "common/arg.cpp at v1.0.0 · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/blob/v1.0.0/common/arg.cpp"},
  {"t": "ggml/src/ggml-common.h at v1.0.0 · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/blob/v1.0.0/ggml/src/ggml-common.h"},
  {"t": "server: fix --cors-origins handling + protect against DNS rebinding (#32098) · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/pull/32098"},
  {"t": "server: explicit opt-in tools via non-loopback addr, check cors host port (#32113) · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/pull/32113"},
  {"t": "server: disallow reaching local addresses from CORS proxy and media URLs (#32115) · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/pull/32115"},
  {"t": "common : restrict HF token to huggingface.co hosts (#31730) · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/pull/31730"},
  {"t": "llama_moe_cache: run missed experts on CPU, add tuning script (#30966) · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/pull/30966"},
  {"t": "Releases and versioning of ggml-org projects · ggml-org/ggml discussion #1579", "u": "https://github.com/ggml-org/ggml/discussions/1579"},
  {"t": "Build llama.cpp locally · docs/build.md · ggml-org/llama.cpp", "u": "https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md"},
  {"t": "Buy · Hongdam", "u": "https://hongdam.net/buy/?c=ai-own"}
 ],
 "card": {"big": "llama.cpp 1.0.0: what breaks, what it adds", "sub": "36 calls removed · FP8 KV cache · server locks down · 13 November 2026"}}
---
llama.cpp, the program that runs open-weight language models on your own computer, published version 1.0.0 on 13 November 2026 at 10:20 UTC [1]. The release page itself says one line, that a new version is out, with a note promising more at 15:00 CET; the notes are in the pull request that bumped the version, merged at 09:06 UTC [2]. It is the first major version, and under the versioning rules proposed in the project's own discussion a major number means a break in the public library interface or the server's inference endpoints [19]. Both happen here.

## 36 functions and one flag are gone from the header

The notes list the removal of `llama_set_warmup`, 35 deprecated functions, the `defrag_thold` field of the context parameters and the `--defrag-thold` command-line option [2][3]. We read the two tagged headers on 13 November 2026: `llama.h` at v0.9.0 marks 36 functions `DEPRECATED` [4]; at v1.0.0 none is marked and none of the 36 is declared [5]. A deprecated function is one that still works but carries a warning naming its replacement; since 1.0.0 the compiler reports the old name as undeclared instead.

The 36 fall into five families, each with the replacement the v0.9.0 header names [4]:

| Removed, v0.9.0 header | Replacement |
| --- | --- |
| `llama_load_model_from_file`, `llama_free_model`, `llama_new_context_with_model` | `llama_model_load_from_file`, `llama_model_free`, `llama_init_from_model` |
| `llama_n_ctx_train`, `llama_n_embd`, `llama_n_layer`, `llama_n_head`, `llama_n_vocab` | `llama_model_n_ctx_train`, `llama_model_n_embd`, `llama_model_n_layer`, `llama_model_n_head`, `llama_vocab_n_tokens` |
| `llama_get_state_size`, `llama_copy_state_data`, `llama_set_state_data`, `llama_load_session_file`, `llama_save_session_file` | `llama_state_get_size`, `llama_state_get_data`, `llama_state_set_data`, `llama_state_load_file`, `llama_state_save_file` |
| `llama_token_get_text`, `llama_token_get_score`, `llama_token_get_attr`, `llama_token_is_eog`, `llama_token_is_control`, `llama_token_bos`, `llama_token_eos`, `llama_token_eot`, `llama_token_cls`, `llama_token_sep`, `llama_token_nl`, `llama_token_pad`, `llama_add_bos_token`, `llama_add_eos_token`, the six `llama_token_fim_*`, `llama_vocab_cls` | the same name with `llama_vocab_` in place of `llama_token_`; `llama_vocab_get_add_bos`, `llama_vocab_get_add_eos` |
| `llama_set_warmup`, `llama_sampler_init_grammar_lazy` | warm-up runs in your own code; `llama_sampler_init_grammar_lazy_patterns` |

One grep finds every one of them in a code base:

```sh
grep -rnE 'llama_(load_model_from_file|free_model|new_context_with_model|n_(ctx_train|embd|layer|head|vocab)|(get_state_size|copy_state_data|set_state_data|load_session_file|save_session_file)|token_(get_text|get_score|get_attr|is_eog|is_control|bos|eos|eot|cls|sep|nl|pad|fim_(pre|suf|mid|pad|rep|sep))|add_(bos|eos)_token|vocab_cls|set_warmup|sampler_init_grammar_lazy)\s*\(' .
```

The same change promotes the NextN and speculative-decoding functions, 18 of them, from the private `llama-ext.h` into `llama.h`, and renames `llama_set_embd_state_src` to `llama_set_ctx_state_src` [2][3]. Speculative decoding is the trick of letting a small draft model guess several tokens that the big model then checks in one pass.

`--defrag-thold` matters beyond C code. The server's router rejects a key it does not know in a `--models-preset` file, so a preset that still sets `defrag-thold` stops the router at start-up with an "option not recognized" error, as a comment on the pull request reports [3].

What stays: the `llama_batch` family. The v1.0.0 header still declares `llama_batch_init`, `llama_batch_get_one`, `llama_decode` and `llama_encode` next to the newer `llama_batch_ext` calls [5]. A migration guide for it is an open pull request, and a reviewer there asked for a deprecation period before any removal [6].

## Who is on the old header today

Anything compiled against `llama.h` by its old names: a C or C++ app, a Go, Rust, Dart or Swift binding, or a Python wheel that bundles the library. llama-cpp-python's newest wheel is 0.3.36 of 1 October 2026 [7], and its main branch pins llama.cpp at a commit of 8 November 2026, four days before the prune merged [8], so it builds and runs today; the break arrives the day it moves its pin. Homebrew's formula is at 0.9.0 on 13 November 2026 [9], which is the version `brew install llama.cpp` gives.

## FP8 KV cache: 8 bits a value, the same perplexity as 8-bit blocks, CUDA for now

The KV cache is the model's memory of the conversation so far, so that each new token is compared against the old ones without rereading them; at long contexts it is the biggest thing in the GPU after the weights. Version 1.0.0 adds an FP8 cache, chosen with `-ctk f8_e4m3 -ctv f8_e4m3`, with optional static per-tensor scales [2][10]. FP8 E4M3 is an 8-bit floating-point number with one sign bit, four exponent bits and three bits of mantissa. The list of cache types in `common/arg.cpp` at v1.0.0 now reads f32, f16, bf16, f8_e4m3, q8_0, q4_0, q4_1, iq4_nl, q5_0 and q5_1 [12].

```chart
{"title": "Bits per cached value", "unit": " bits", "lower_is_better": true,
 "rows": [["f16", 16], ["q8_0", 8.5], ["f8_e4m3", 8], ["q4_0", 4.5]],
 "note": "From the block definitions in ggml-common.h at v1.0.0: q8_0 and q4_0 store a 16-bit scale per block of 32 values, half a bit each. f8_e4m3 stores one byte per value and no block scale."}
```

The `q8_0` block is 32 signed bytes and one 16-bit scale, 8.5 bits a value; `q4_0` is 32 four-bit values and the same scale, 4.5 bits [13]. So FP8 saves 6% over `q8_0` and half over `f16`, and what it buys is a format the GPU's tensor cores read directly rather than one the kernel has to decode first. The CUDA kernels came in on 11 November 2026, tested on an RTX PRO 4500, a Blackwell card [11]. The author's quality table on that pull request, Wikitext-2 perplexity, where lower means the model predicts text better [11]:

| Model, 11 November 2026 | BF16 cache | q8_0 cache | FP8 E4M3 cache |
| --- | --- | --- | --- |
| NVFP4_fp8 | 5.4527 | 5.4491 | 5.4550 |
| NVFP4_fp8_q8 | 5.4727 | 5.4641 | 5.4812 |

The three columns sit within 0.02 of each other. The notes name FP8 kernels for CUDA and say nothing about FP8 on Metal, Apple's GPU, so what `-ctk f8_e4m3` does on a Mac is not in the release notes and not measured here. For an NVIDIA box serving long contexts, the move is one flag, and the memory comes back at the next restart.

## The server refuses more by default

Four changes land for `llama-server`, the HTTP server most apps talk to [2]:

- With `--tools` or `--agent`, the web UI works on localhost by name or by its loopback number; any other host name on a loopback connection gets a 403. Behind a reverse proxy, `--agent` now needs `--cors-origins` set to the public origin, or the UI gets a 403. The fix closes DNS rebinding, where a page whose host name resolves to the loopback address could call `/tools` on a local server [14].
- Tools or MCP on a `--host` that is not loopback, with no API key, refuse to start unless `--allow-unauthenticated-tools` is passed [15].
- The CORS proxy no longer reaches local addresses at all, and a media URL on the LAN, a photo on a NAS for instance, needs `--media-allow-private-urls` [16].
- `HF_TOKEN` goes only to huggingface.co hosts; a `--model-url` elsewhere no longer carries it, and `MODEL_ENDPOINT` is the explicit way to trust another host [17].

## A cache for mixture-of-experts models with one GPU

A mixture-of-experts model uses a small part of itself for each token. When the experts do not fit in the GPU, 1.0.0 leaves them in system RAM, caches some on the GPU, and computes a share of the misses on the CPU instead of copying them over, set with `--moe-cache-mib` and `--moe-cache-cpu-share`; `scripts/moe-cache-tune.py` runs the server at several settings and prints the ones that fit the machine [18]. The author's desktop example in the description runs at about 24 tokens a second with a 6,464 MiB cache and no CPU share, and at 83 with the recommended 24,000 MiB cache [18]; commenters with other cards report smaller gains, and some report that a high CPU share slows a machine with slow RAM, so the script's numbers for your own box are the ones that count.

## Getting it

The release page links the nightly build b12359 for binaries; the macOS arm64 archive is 16.9 MB [1]. From source: clone, `cmake -B build`, `cmake --build build --config Release`, with Metal on by default on a Mac [20]. The project's versioning discussion of 7 August 2026 describes weekly releases and semantic versioning, under which the next break of this size is a 2.0.0 [19]. Hongdam installs a local model and the server on a customer's own computer and pins the version that was tested [21].
