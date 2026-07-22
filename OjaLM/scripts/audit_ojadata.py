import os
import json
import glob

def audit_ojadata(file_path):
    print(f"==================================================")
    print(f" OJADATA QUALITY AUDIT: {os.path.basename(file_path)}")
    print(f"==================================================")

    if not os.path.exists(file_path):
        print(f"[!] File not found: {file_path}")
        return False

    total_records = 0
    eligible_count = 0
    quality_flag_distribution = {}
    language_distribution = {"English": 0, "Pidgin": 0, "Yoruba": 0, "Hausa": 0, "Igbo": 0, "Other": 0}
    turn_counts = []
    errors = []

    with open(file_path, "r", encoding="utf-8") as f:
        for idx, line in enumerate(f):
            line = line.strip()
            if not line:
                continue
            total_records += 1

            try:
                data = json.loads(line)
            except Exception as e:
                errors.append(f"Line {idx+1}: Invalid JSON - {str(e)}")
                continue

            # Check structure (supports messages, conversations, or instruction/output)
            messages = data.get("messages") or data.get("conversations")
            instruction = data.get("instruction")
            output = data.get("output")

            if messages:
                turn_counts.append(len(messages))
            elif instruction and output:
                turn_counts.append(2)
            else:
                errors.append(f"Line {idx+1}: Missing conversation format (messages, conversations, or instruction/output)")

            # Metadata check
            meta = data.get("metadata", {})
            if meta.get("is_training_eligible", True):
                eligible_count += 1

            flags = meta.get("quality_flags", [])
            for flag in flags:
                quality_flag_distribution[flag] = quality_flag_distribution.get(flag, 0) + 1

            lang = meta.get("language", "English")
            language_distribution[lang] = language_distribution.get(lang, 0) + 1

    print(f" Total Records Audited      : {total_records}")
    print(f" Training Eligible Records  : {eligible_count} ({eligible_count/total_records*100:.1f}%)" if total_records else "0")
    print(f" Avg Conversation Turns     : {sum(turn_counts)/len(turn_counts):.2f}" if turn_counts else "0")
    
    print("\n--- Quality Flag Distribution ---")
    for flag, cnt in quality_flag_distribution.items():
        print(f"  * {flag}: {cnt}")

    print("\n--- Language Distribution ---")
    for lang, cnt in language_distribution.items():
        if cnt > 0:
            print(f"  * {lang}: {cnt}")

    if errors:
        print(f"\n[ERROR] Found {len(errors)} errors:")
        for err in errors[:10]:
            print(f"  * {err}")
        return False
    else:
        print("\n[OK] OjaData Audit Passed with Zero Syntax/Structure Errors!")
        return True

if __name__ == "__main__":
    ojadata_files = glob.glob(os.path.join(os.path.dirname(__file__), "..", "datasets", "ojadata", "*.jsonl"))
    if not ojadata_files:
        # Also check default generate output path
        ojadata_files = [os.path.join(os.path.dirname(__file__), "..", "datasets", "ojadata", "ojadata_v2.jsonl")]
        
    for f in ojadata_files:
        audit_ojadata(f)
