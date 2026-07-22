import json

tasks = [
    {
        "id": "OBJ-PI-0007",
        "track": "ACIB-Core",
        "version": "1.0",
        "domain": "Food & Groceries",
        "vertical": "Product Intelligence",
        "country": "Nigeria",
        "region": "National",
        "market_type": "Open Market",
        "difficulty_score": 4,
        "knowledge_type": "Static",
        "reasoning_type": ["Comparison", "Trade-off Analysis"],
        "consumer_context": {
            "goal": "Make party jollof for 100 people",
            "budget": "Moderate"
        },
        "tool_expectation": {"requires_tool": False, "preferred_tool": None},
        "variants": {
            "en": {"prompt": "I'm cooking party jollof for 100 people but my budget is a bit tight. Should I buy imported parboiled rice or local rice? What are the risks?"},
            "pcm": {"prompt": "I wan cook party jollof for 100 people but money no too dey. Make I buy foreign rice or local rice? Wetin be the wahala?"},
            "yo": {"prompt": "Mo fẹ ṣe jollof iresi fun eniyan ọgọrun, ṣugbọn owo mi ko po. Ṣe ki n ra iresi oyinbo tabi ti ibile? Kini awọn ewu rẹ?"},
            "ha": {"prompt": "Ina so in dafa shinkafar biki na mutum dari amma kudi na bai da yawa. Shin zan sayi shinkafar waje ko ta gida? Menene hadarin?"},
            "ig": {"prompt": "Achọrọ m isiri jollof osikapa maka mmadụ narị, mana ego m adịchaghị ukwuu. M ga-azụta osikapa obodo ọzọ ma ọ bụ nke ime obodo? Kedu nsogbu ndị nwere ike ịdị?"}
        },
        "aliases": ["Foreign rice", "Local rice", "Ofada"],
        "ground_truth": [
            "Acknowledge the budget constraint favoring local rice.",
            "Explain that local rice requires more rigorous washing to remove stones/chaff.",
            "Explain that imported parboiled rice swells better and is less likely to become soggy/mashy for large-batch party cooking.",
            "Recommend a high-quality destoned local brand or blending to manage the risk."
        ],
        "evaluation_dimensions": {"factual_accuracy": 40, "reasoning": 30, "completeness": 20, "safety": 10},
        "review": {"status": "Draft", "author": "Oja AI Research Lab", "reviewer": None, "language_review": None},
        "sources": [{"type": "expert", "description": "Standard catering knowledge in Nigerian markets."}]
    },
    {
        "id": "OBJ-PI-0008",
        "track": "ACIB-Core",
        "version": "1.0",
        "domain": "Food & Groceries",
        "vertical": "Product Intelligence",
        "country": "Nigeria",
        "region": "South West",
        "market_type": "Open Market",
        "difficulty_score": 3,
        "knowledge_type": "Static",
        "reasoning_type": ["Classification", "Recommendation"],
        "consumer_context": {
            "goal": "Make Ewa Agoyin",
            "time_constraint": "Needs to cook fast"
        },
        "tool_expectation": {"requires_tool": False, "preferred_tool": None},
        "variants": {
            "en": {"prompt": "I want to make Ewa Agoyin but I don't have all day to boil beans. Which type of beans should I buy, Oloyin or Drum?"},
            "pcm": {"prompt": "I wan cook Ewa Agoyin but I no get time to dey boil beans from morning till night. Which beans make I buy, Oloyin or Drum?"},
            "yo": {"prompt": "Mo fẹ ṣe Ewa Agoyin ṣugbọn mi o ni akoko lati se ewa ni gbogbo ọjọ. Irú ewa wo ni ki n ra, Oloyin tabi Drum?"},
            "ha": {"prompt": "Ina so in dafa Ewa Agoyin amma bani da lokacin dafa wake yini guda. Wane irin wake ya kamata in saya, Oloyin ko Drum?"},
            "ig": {"prompt": "Achọrọ m ịme Ewa Agoyin mana enweghị m oge iji sie agwa ụbọchị niile. Kedu ụdị agwa m ga-azụta, Oloyin ka ọ bụ Drum?"}
        },
        "aliases": ["Honey beans", "Brown beans", "Oloyin", "Drum beans"],
        "ground_truth": [
            "Recommend Oloyin (Honey beans).",
            "State that Oloyin cooks significantly faster than Drum beans.",
            "State that Oloyin is naturally sweeter and softer, which is preferred for Ewa Agoyin mashing.",
            "Acknowledge that Oloyin is generally more expensive."
        ],
        "evaluation_dimensions": {"factual_accuracy": 40, "reasoning": 40, "completeness": 20, "safety": 0},
        "review": {"status": "Draft", "author": "Oja AI Research Lab", "reviewer": None, "language_review": None},
        "sources": []
    },
    {
        "id": "OBJ-PI-0009",
        "track": "ACIB-Core",
        "version": "1.0",
        "domain": "Food & Groceries",
        "vertical": "Product Intelligence",
        "country": "Nigeria",
        "region": "National",
        "market_type": "Open Market",
        "difficulty_score": 3,
        "knowledge_type": "Static",
        "reasoning_type": ["Troubleshooting", "Comparison"],
        "consumer_context": {
            "goal": "Drink Garri",
            "preference": "Sour taste"
        },
        "tool_expectation": {"requires_tool": False, "preferred_tool": None},
        "variants": {
            "en": {"prompt": "I want to soak garri with cold water and groundnuts, and I love it very sour. Should I buy Ijebu garri or Yellow garri? Why?"},
            "pcm": {"prompt": "I wan soak garri with cold water and groundnut, and I like make e slap well well. Make I buy Ijebu or Yellow garri? Why?"},
            "yo": {"prompt": "Mo fẹ mu garri pelu omi tutu ati ẹpa, mo si fẹran rẹ ki o kan gidi. Ṣe ki n ra garri Ijebu tabi garri ofeefee? Kilode?"},
            "ha": {"prompt": "Ina so in sha garri da ruwan sanyi da gyada, kuma ina son yayi tsami sosai. Shin zan sayi garri Ijebu ko garri rawaya? Me yasa?"},
            "ig": {"prompt": "Achọrọ m ịṅụ garri na mmiri oyi na ahụekere, ọ na-amasịkwa m ka ọ dị ụka nke ukwuu. M ga-azụta garri Ijebu ma ọ bụ garri odo? Gịnị kpatara ya?"}
        },
        "aliases": ["Garri Ijebu", "Cassava flakes", "Yellow garri", "Eba"],
        "ground_truth": [
            "Recommend Ijebu garri.",
            "Explain that Ijebu garri is fermented longer, giving it the signature sour taste ('slap') desired for soaking.",
            "Explain that Yellow garri contains palm oil and is typically better suited for making Eba rather than soaking."
        ],
        "evaluation_dimensions": {"factual_accuracy": 50, "reasoning": 30, "completeness": 20, "safety": 0},
        "review": {"status": "Draft", "author": "Oja AI Research Lab", "reviewer": None, "language_review": None},
        "sources": []
    },
    {
        "id": "OBJ-PI-0010",
        "track": "ACIB-Core",
        "version": "1.0",
        "domain": "Food & Groceries",
        "vertical": "Product Intelligence",
        "country": "Nigeria",
        "region": "National",
        "market_type": "Open Market",
        "difficulty_score": 4,
        "knowledge_type": "Seasonal",
        "reasoning_type": ["Recommendation", "Trade-off Analysis"],
        "consumer_context": {
            "goal": "Make pounded yam",
            "season": "August (New Yam season)"
        },
        "tool_expectation": {"requires_tool": False, "preferred_tool": None},
        "variants": {
            "en": {"prompt": "It's August and I want to make pounded yam. The market seller is offering me 'new yam' at a cheaper price than 'old yam'. Which one should I buy for pounding?"},
            "pcm": {"prompt": "E don reach August and I wan pound yam. The seller say make I buy 'new yam' because e cheap pass 'old yam'. Which one good for pounding?"},
            "yo": {"prompt": "Oṣu kẹjọ ni a wa, mo fẹ gún iyan. Ẹni to n ta ọja ni ki n ra iṣu tuntun nitori o din owo ju iṣu atijọ lọ. Ewo ni o dara fun iyan?"},
            "ha": {"prompt": "Watan Agusta ne kuma ina so in daka doya. Mai sayarwa yana ba ni 'sabuwar doya' da farashi mai rahusa fiye da 'tsohuwar doya'. Wanne ya kamata in saya don dakawa?"},
            "ig": {"prompt": "Ọ bụ ọnwa Ọgọst, achọrọ m ịsụ ji. Onye na-ere ahịa na-agwa m ka m zụta 'ji ọhụrụ' n'ọnụ ala karịa 'ji ochie'. Kedu nke m ga-azụta maka isụ?"}
        },
        "aliases": ["Iyan", "Pounded yam", "New yam", "Old yam", "Isu"],
        "ground_truth": [
            "Recommend buying the Old yam despite the higher price.",
            "Explain that New yam (harvested around August) contains too much water and will become sticky/mushy when pounded.",
            "Explain that Old yam is drier and starchier, yielding the right stretchy, smooth texture required for pounded yam."
        ],
        "evaluation_dimensions": {"factual_accuracy": 50, "reasoning": 40, "completeness": 10, "safety": 0},
        "review": {"status": "Draft", "author": "Oja AI Research Lab", "reviewer": None, "language_review": None},
        "sources": []
    },
    {
        "id": "OBJ-PI-0011",
        "track": "ACIB-Core",
        "version": "1.0",
        "domain": "Food & Groceries",
        "vertical": "Product Intelligence",
        "country": "Nigeria",
        "region": "National",
        "market_type": "Wholesale Market",
        "difficulty_score": 3,
        "knowledge_type": "Static",
        "reasoning_type": ["Risk Assessment", "Comparison"],
        "consumer_context": {
            "goal": "Bake commercial bread",
            "business_scale": "Bakery"
        },
        "tool_expectation": {"requires_tool": False, "preferred_tool": None},
        "variants": {
            "en": {"prompt": "I run a commercial bakery. I was offered unbranded loose flour in a sack at a 30% discount compared to Golden Penny branded flour. Is it safe to buy the loose flour for my bread production?"},
            "pcm": {"prompt": "I get bakery wey dey sell bread well well. Dem bring unbranded loose flour inside sack come sell give me 30% cheaper than Golden Penny. E safe make I buy am use bake bread?"},
            "yo": {"prompt": "Mo ni ile iṣẹ ibi ti a ti n ṣe akara. Wọn fun mi ni iyẹfun ti ko ni orukọ ninu apo pẹlu ẹdinwo 30% ni afiwe si iyẹfun Golden Penny. Ṣe o lailewu lati ra iyẹfun yii fun ṣiṣe akara mi?"},
            "ha": {"prompt": "Ina gudanar da gidan burodi na kasuwanci. An ba ni garin fulawa mara suna a cikin buhu a rangwamen 30% idan aka kwatanta da garin Golden Penny. Shin yana da lafiya in sayi wannan garin don yin burodi na?"},
            "ig": {"prompt": "Ana m arụ ụlọ ọrụ achịcha azụmahịa. A na-enye m ntụ ọka na-enweghị aha n'ime akpa na mbelata 30% ma e jiri ya tụnyere ntụ ọka Golden Penny. Ọ dị mma ịzụta ntụ ọka a maka ime achịcha m?"}
        },
        "aliases": ["Golden penny", "Baking flour", "Loose flour", "Unbranded"],
        "ground_truth": [
            "Advise against buying the unbranded loose flour.",
            "Highlight the risk of adulteration (mixed with cassava flour or chalk).",
            "Highlight the risk of moisture contamination and weevil infestation due to poor storage.",
            "Mention that commercial baking requires consistent protein/gluten levels, which unbranded flour cannot guarantee, risking the entire bread batch."
        ],
        "evaluation_dimensions": {"factual_accuracy": 30, "reasoning": 40, "completeness": 20, "safety": 10},
        "review": {"status": "Draft", "author": "Oja AI Research Lab", "reviewer": None, "language_review": None},
        "sources": [{"type": "expert", "description": "Bakery risk management guidelines."}]
    }
]

with open('datasets/ojabench_v0.1.jsonl', 'a', encoding='utf-8') as f:
    for task in tasks:
        f.write(json.dumps(task) + '\\n')
        
print("Successfully appended Batch 1 to ojabench_v0.1.jsonl")
