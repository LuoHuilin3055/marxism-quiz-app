import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT.parent / "马克思主义.pdf"
OUT_PATH = ROOT / "src" / "data" / "questions.json"


def clean_text(text: str) -> str:
    text = re.sub(r"(?m)^\s*\d+\s*$", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s*\n\s*", "", text)
    return text.strip()


def parse_options(text: str) -> list[str]:
    matches = list(re.finditer(r"([A-Z])\.", text))
    options: list[str] = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        option = clean_text(text[start:end])
        if option:
            options.append(option)
    return options


def normalize_answer(answer: str, question_type: str):
    letters = re.findall(r"[A-Z]", answer.upper())
    if question_type == "multiple":
        return letters
    return letters[0] if letters else ""


def parse_question(block: str) -> dict | None:
    first_line = block.splitlines()[0].strip()
    id_match = re.match(r"^(\d+)\.(.*)$", first_line)
    if not id_match:
        return None

    qid = int(id_match.group(1))
    body = re.sub(r"^\d+\.", "", block, count=1).strip()
    type_match = re.search(r"(单选题|多选题)（[^）]*）", body)
    if not type_match:
        return None

    question_type = "single" if type_match.group(1) == "单选题" else "multiple"
    question = clean_text(body[: type_match.start()])
    rest = body[type_match.end() :].strip()

    answer_match = re.search(r"正确答案：\s*([A-Z]+)", rest)
    if not answer_match:
        return None

    options_text = rest[: answer_match.start()]
    after_answer = rest[answer_match.end() :]
    analysis = ""
    analysis_marker = "答案解析："
    if analysis_marker in after_answer:
        analysis = clean_text(after_answer.split(analysis_marker, 1)[1])

    return {
        "id": qid,
        "question": question,
        "options": parse_options(options_text),
        "answer": normalize_answer(answer_match.group(1), question_type),
        "analysis": analysis,
        "type": question_type,
    }


def main() -> None:
    with pdfplumber.open(PDF_PATH) as pdf:
        page_texts = [page.extract_text() or "" for page in pdf.pages]

    if sum(len(text.strip()) for text in page_texts) < 500:
        raise SystemExit("PDF_TEXT_TOO_SHORT_NEEDS_OCR")

    full_text = "\n".join(page_texts)
    starts = list(re.finditer(r"(?m)^(\d+)\.", full_text))
    questions: list[dict] = []
    failed_ids: list[int] = []

    for index, start in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(full_text)
        block = full_text[start.start() : end].strip()
        parsed = parse_question(block)
        if parsed:
            parsed["id"] = len(questions) + 1
            questions.append(parsed)
        else:
            match = re.match(r"^(\d+)\.", block)
            if match:
                failed_ids.append(int(match.group(1)))

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(questions, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        json.dumps(
            {
                "pages": len(page_texts),
                "questions": len(questions),
                "first_id": questions[0]["id"] if questions else None,
                "last_id": questions[-1]["id"] if questions else None,
                "failed_ids": failed_ids,
                "single": sum(1 for item in questions if item["type"] == "single"),
                "multiple": sum(1 for item in questions if item["type"] == "multiple"),
                "bad_option_counts": [
                    item["id"] for item in questions if len(item["options"]) < 4
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
