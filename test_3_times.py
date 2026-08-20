import json
import urllib.request
import time

url = "http://127.0.0.1:1234/v1/chat/completions"

tests = [
    "What is 15 + 27? Answer with the number only.",
    "What is the capital of Japan? Answer with the city name only.",
    "What is 100 divided by 4? Answer with the number only."
]

for i, prompt in enumerate(tests, 1):
    print(f"\n--- Running Test {i}/3: '{prompt}' ---")
    start = time.time()
    payload = {
        "model": "qwen3.5-4b",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens": 50
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        ans = data["choices"][0]["message"]["content"]
        if not ans and "reasoning_content" in data["choices"][0]["message"]:
            ans = data["choices"][0]["message"]["reasoning_content"]
        elapsed = round(time.time() - start, 2)
        print(f"Test {i} Response ({elapsed}s): {ans.strip()}")

print("\n>>> ALL 3 TESTS COMPLETED SUCCESSFULLY! <<<")
