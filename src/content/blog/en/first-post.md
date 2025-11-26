
---
title: "Auditing Sensitive Data: A Practical Guide with Cryptic"
description: "Learn to detect and validate PII protection (RUT, Emails, Cards) in your systems using Cryptic."
pubDate: "2025-11-25"
updatedDate: "2025-11-25"
heroImage: "https://i.pinimg.com/1200x/4e/32/90/4e3290392ccafac9eec67f4c4cb7a5b9.jpg"
tags: ["security", "python", "open-source", "privacy", "pii"]
---

In my experience building systems for the financial and health sectors, I've learned a painful lesson: **sensitive data (PII) has a bad habit of showing up where you least expect it**. Application logs, "anonymized" database dumps, or simple report CSV files are often vectors for massive information leaks.

Recently, I found myself auditing a legacy system and needed a fast, local, and reliable way to scan thousands of records for unprotected Chilean RUTs (National IDs), emails, and credit cards. Manual Regular Expressions (Regex) are prone to errors and false positives.

That's why I created (and recommend using) **Cryptic**. It is a Python library designed to detect sensitive data and verify if it is hashed or exposed in plain text.

## How to audit a dataset using this tool?

Before touching any data, we need a clean environment. I am a firm believer in not polluting your operating system's global Python interpreter.

Dependency isolation avoids version conflicts between projects. Furthermore, when working with security tools, you want to ensure that the code you execute is exactly what you expect, without external interference.

We use `venv` (integrated into Python 3) to create a lightweight directory containing an isolated copy of the Python and pip binaries. By "activating" it, we temporarily modify your shell's `$PATH` variable.

### Requirements

-- Requires Python 3.10 or higher.
-- A virtual environment created and activated.
-- If using Windows, the activation command varies slightly (`Scripts\activate`).
-- The `cryptic` library installed and ready to use.

### Refs

-- [Python venv documentation](https://docs.python.org/3/library/venv.html)
-- [Cryptic GitHub Repository](https://github.com/Dxnale/cryptic)

### Steps

Create the virtual environment in your working directory:

```bash
python3 -m venv venv
````

Activate the environment:

```bash
source venv/bin/activate
```

Install the library from PyPI:

```bash
pip install cryptic
```

> Here is the one-liner version ;)
>
> ```bash
> python3 -m venv venv && source venv/bin/activate && pip install cryptic
> ```

-----

### Exploratory Analysis (CLI)

Often, I just need to quickly verify if a specific string is valid or if the detection algorithm is working as expected. For this, the CLI is superior to writing a script.

This is to verify false positives quickly. If you see a number that looks like a RUT or a credit card in a log, you want to confirm its mathematical validity (Luhn, Modulo 11) before raising a security alert.

### How does it work?

The CLI invokes the `CrypticAnalyzer` class, detects the pattern using optimized Regex, and then applies checksum validation algorithms. It also checks entropy and common hash patterns (bcrypt, sha256) to determine the protection status.

### Our Goals with This

-- Confirm that the tool correctly detects a test datum.
-- Understand the JSON/structured output of the tool.

### Example

Run an analysis on a test Chilean RUT (fictional but mathematically valid):

```bash
cryptic analyze "12.345.678-5"
```

> You should see an output similar to this:
>
> ```
> 🔒 12.345.678-5
>    Status: Unprotected
>    Sensitivity: Critical Sensitivity
>    Confidence: 98.0%
> ```

Test with an email address to verify standard PII detection:

```bash
cryptic analyze "admin@company.cl"
```

### Batch File Auditing

This is my main use case. You have an exported CSV (`dump.csv`) and you need to know which columns contain sensitive data in plain text.

Reviewing files line by line is inhumane and impossible at scale. Batch processing automates pattern detection in large volumes of data and allows you to generate compliance reports.

### Notes

-- Ensure you have read permissions for the file.
-- Performance will depend on the file size and your machine's CPU.

### Steps

Generate a test data file (or use your own CSV):

```bash
echo "id,email,password_hash\n1,user@test.com,\$2b\$12\$..." > users_test.csv
```

Run the batch analysis and export the result:

```bash
cryptic batch users_test.csv --output=security_audit.json
```

Inspect the generated report:

```bash
cat security_audit.json
```

> Here's a tip:
> If you want to filter the JSON immediately to see only the "Unprotected" items using `jq` (a tool I strongly recommend):
>
> ```bash
> cryptic batch users_test.csv --output=- | jq '.[] | select(.protection_status == "Unprotected")'
> ```

-----

### Python Integration

For software engineers, the final goal is automation. I usually integrate this into my CI/CD pipelines or pre-commit scripts to prevent real test data from reaching the repository.

Preventive control is cheaper than reactive correction. Detecting PII *while* data is being processed allows you to anonymize it on the fly.

### Steps

Create a simple audit script `audit.py`:

```python
from cryptic import CrypticAnalyzer

# Instantiate the analyzer
analyzer = CrypticAnalyzer()

# Simulated data that could come from an API
incoming_data = ["99.555.111-K", "non-sensitive", "4111111111111111"]

results = analyzer.analyze_batch(incoming_data)

for result in results:
    if result.sensitivity_level.value == "critical" and result.protection_status.value == "unprotected":
        print(f"⚠️ ALERT: Exposed critical data detected: {result.original_data}")
```

Run the script:

```bash
python audit.py
```

-----

### You Must Keep in Mind 🚨

When we use tools like `cryptic` on real production data, the risk is not the tool, but what we do with the report.

**The Risk:**
If you generate a report (`audit.json`) that explicitly contains the found sensitive data ("Found RUT 12.345..."), you have just created a new file with sensitive data. If you upload that report to a Jira ticket, Slack, or GitHub, **you have caused a data breach**.

**Mitigation:**

-- Run these audits in volatile environments (containers that are destroyed).
-- Never persist full reports without encryption.
-- Configure the tool (this will be possible in future versions) so the report only says "Row 5: RUT detected" instead of showing the RUT value.

**Emergency Cleanup:**
If you accidentally generated a report with real data on your disk:

Delete it securely (not just `rm`):

```bash
shred -u security_audit.json
```

If you find this library useful for your compliance audits in Chile or anywhere else, consider leaving a star on the repository. It helps keep the project alive.
