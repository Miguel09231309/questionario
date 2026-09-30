# Security Specification for School Questionnaire System

## Data Invariants
1. A Question (`pergunta`) must have a valid non-empty id, statement (`enunciado`), and valid category and response type.
2. A Room (`sala`) must have a valid non-empty id and name.
3. A Class (`turma`) must have a valid non-empty id, name, and valid school shift (`turno`).
4. A Response submission (`resposta`) must reference valid strings for professor name, room id, class id, and contain a dictionary of answers with a non-negative timestamp.

## The Dirty Dozen Payloads Handled
1. Injected junk character strings exceeding length boundaries.
2. Negative timestamps or future invalid values.
3. Injected unexpected keys / shadow fields.
4. Overwriting immutable identification fields.
5. Injected script tags or malformed non-string keys.
6. Null or undefined answer values in required payload mappings.
7. Unlisted category assignments on questions.
8. Unlisted question response types.
9. Blank professor names or room names.
10. Unbounded arrays or arbitrary document nesting.
11. Malformed room capacity values.
12. Attempted unauthorized deletion without ID match.
