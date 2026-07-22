import json
import os

golden_dir = 'datasets/acib/golden'
filepath = 'datasets/acib/v0.1.jsonl'
os.makedirs(golden_dir, exist_ok=True)

tasks = [
    {
        "id": "OBJ-SR-0043",
        "track": "ACIB-Core",
        "version": "1.0",
        "domain": "Food & Groceries",
        "vertical": "Shopping Reasoning",
        "country": "Nigeria",
        "region": "National",
        "market_type": "Open Market",
        "difficulty_score": 5,
        "knowledge_type": "Static",
        "reasoning_type": ["Budgeting", "Planning", "Trade-off Analysis"],
        "consumer_context": {
            "budget": "₦15,000",
            "goal": "Feed 6 people for 3 days",
            "constraint": "Nutritional balance required"
        },
        "tool_expectation": {"requires_tool": False, "preferred_tool": None},
        "variants": {
            "en": {"prompt": "I only have ₦15,000 to feed my family of six for the next three days. What should I buy from the market to make sure we are full and eat reasonably well?"},
            "pcm": {"prompt": "I get just ₦15,000 to feed six people for three days. Wetin and wetin make I buy for market so that we go chop belleful and the food go make sense?"},
            "yo": {"prompt": "₦15,000 nikan ni mo ni lati bọ eniyan mẹfa fun ọjọ mẹta. Kini ki n ra lọja lati rii daju pe a jẹ yó, ti ounjẹ naa si bọ si ara?"},
            "ha": {"prompt": "Ina da ₦15,000 kacal don ciyar da iyalina na mutum shida na tsawon kwanaki uku. Menene ya kamata in saya a kasuwa don tabbatar da mun koshi kuma mun ci abinci mai kyau?"},
            "ig": {"prompt": "Enwere m naanị ₦15,000 iji nye ezinụlọ m nke mmadụ isii nri maka ụbọchị atọ. Gịnị ka m ga-azụta n'ahịa iji hụ na anyị juru afọ ma rie nri nke ọma?"}
        },
        "aliases": ["Provisions", "Foodstuffs"],
        "ground_truth": [
            "Acknowledge that ₦15,000 is a very tight budget for 18 total meals (6 people x 3 days).",
            "Recommend bulking out meals with cheap carbohydrates (e.g., Garri, Yam, or loose Rice).",
            "Recommend affordable proteins like Eggs or dried fish (Panla/Kote) instead of beef or chicken.",
            "Provide a rough allocation (e.g., ₦6,000 for carbs, ₦4,000 for proteins/fish, ₦3,000 for tomatoes/pepper/oil, ₦2,000 for seasoning/gas)."
        ],
        "evaluation_dimensions": {"factual_accuracy": 20, "reasoning": 50, "completeness": 30, "safety": 0},
        "review": {"status": "Golden", "author": "Oja AI Research Lab", "reviewer": None, "language_review": None},
        "sources": []
    },
    {
        "id": "OBJ-NG-0001",
        "track": "ACIB-Core",
        "version": "1.0",
        "domain": "Food & Groceries",
        "vertical": "Negotiation",
        "country": "Nigeria",
        "region": "National",
        "market_type": "Open Market",
        "difficulty_score": 4,
        "knowledge_type": "Live",
        "reasoning_type": ["Negotiation", "Multi-step Reasoning"],
        "consumer_context": {
            "goal": "Buy 25 liters of Palm Oil",
            "vendor_quote": "₦35,000",
            "market_rate": "~₦28,000"
        },
        "tool_expectation": {"requires_tool": True, "preferred_tool": "get_price"},
        "variants": {
            "en": {"prompt": "The seller is asking for ₦35,000 for a 25-liter keg of palm oil. I know the actual market price is around ₦28,000. How should I reply to bring the price down without making her angry?"},
            "pcm": {"prompt": "Iyaoloja say 25 liters of palm oil na ₦35,000. But I know say normally na around ₦28,000 e dey go. How I go price am make she no vex, but make she bring price down?"},
            "yo": {"prompt": "Iya ọlọja ni ₦35,000 ni garawa epo pupa. Mo mọ pe iwọn ₦28,000 ni wọn n ta a. Bawo ni mo ṣe le na an ti inu rẹ ko fi ni bi, ti yoo si sọ owo isalẹ?"},
            "ha": {"prompt": "Mai sayarwa tana neman ₦35,000 kan jarkar man ja ta lita 25. Na san ainihin farashin kasuwa yana kusan ₦28,000. Yaya zan yi in rage farashin ba tare da na bata mata rai ba?"},
            "ig": {"prompt": "Onye na-ere ahịa na-arịọ ₦35,000 maka galọn mmanụ nkwụ dị lita 25. Ama m na ezigbo ọnụ ahịa ahịa dị gburugburu ₦28,000. Kedu ka m ga-esi aza ka o wedata ọnụ ahịa na-eweghị ya iwe?"}
        },
        "aliases": ["Epo", "Red oil", "Keg"],
        "ground_truth": [
            "Use respectful cultural markers (e.g., calling her 'Iya' or 'Customer').",
            "Do not call the ₦35,000 price a scam or cheat; attribute it to 'the economy' or 'market being dry'.",
            "Suggest a counter-offer anchoring slightly below the target (e.g., ₦26,000) to settle at ₦28,000.",
            "Use a conversational, non-robotic tone."
        ],
        "evaluation_dimensions": {"factual_accuracy": 10, "reasoning": 60, "completeness": 20, "safety": 10},
        "review": {"status": "Golden", "author": "Oja AI Research Lab", "reviewer": None, "language_review": None},
        "sources": []
    },
    {
        "id": "OBJ-CM-0001",
        "track": "ACIB-Core",
        "version": "1.0",
        "domain": "Food & Groceries",
        "vertical": "Commerce Mathematics",
        "country": "Nigeria",
        "region": "National",
        "market_type": "Open Market",
        "difficulty_score": 4,
        "knowledge_type": "Static",
        "reasoning_type": ["Calculation", "Comparison"],
        "consumer_context": {
            "goal": "Buy rice",
            "constraint": "Compare bulk vs retail pricing"
        },
        "tool_expectation": {"requires_tool": False, "preferred_tool": None},
        "variants": {
            "en": {"prompt": "A 50kg bag of imported rice is ₦85,000. If I buy it loose, it costs ₦1,800 per 'derica' tin. Assuming there are 64 dericas in a 50kg bag, how much do I save by buying the full bag instead of buying 64 loose tins?"},
            "pcm": {"prompt": "One 50kg bag of foreign rice na ₦85,000. If I buy am by derica, na ₦1,800 for one. If 64 derica make one bag, how much I go save if I just buy the whole bag instead of loose?"},
            "yo": {"prompt": "Apo iresi 50kg jẹ ₦85,000. Ti mo ba ra a ni derica, ₦1,800 ni ọkan. Ti derica 64 ba wa ninu apo kan, melo ni mo maa fi pamọ ti mo ba ra gbogbo apo ni ẹẹkan?"},
            "ha": {"prompt": "Buhun shinkafar waje na 50kg shine ₦85,000. Idan na sayi gwangwani (derica), farashin shine ₦1,800 kowanne. Idan akwai gwangwani 64 a cikin buhun, nawa zan ajiye idan na sayi cikakken buhun maimakon gwangwani 64?"},
            "ig": {"prompt": "Akpa osikapa 50kg bụ ₦85,000. Ọ bụrụ na m zụta ya na kọp (derica), ọ bụ ₦1,800 maka otu. Ọ bụrụ na e nwere kọp 64 n'ime akpa ahụ, ego ole ka m ga-echekwa ma ọ bụrụ na m zụta akpa ahụ dum kama ịzụta kọp 64?"}
        },
        "aliases": ["Derica", "Cup", "Mudu"],
        "ground_truth": [
            "Calculate the cost of loose tins: 64 * ₦1,800 = ₦115,200.",
            "Subtract the bulk bag cost: ₦115,200 - ₦85,000 = ₦30,200.",
            "State the final savings explicitly as ₦30,200."
        ],
        "evaluation_dimensions": {"factual_accuracy": 70, "reasoning": 20, "completeness": 10, "safety": 0},
        "review": {"status": "Golden", "author": "Oja AI Research Lab", "reviewer": None, "language_review": None},
        "sources": []
    },
    {
        "id": "OBJ-MI-0001",
        "track": "ACIB-Core",
        "version": "1.0",
        "domain": "Food & Groceries",
        "vertical": "Market Intelligence",
        "country": "Nigeria",
        "region": "National",
        "market_type": "Wholesale Market",
        "difficulty_score": 3,
        "knowledge_type": "Seasonal",
        "reasoning_type": ["Planning", "Risk Assessment"],
        "consumer_context": {
            "goal": "Stock up on goods",
            "season": "Two weeks before Ramadan"
        },
        "tool_expectation": {"requires_tool": False, "preferred_tool": None},
        "variants": {
            "en": {"prompt": "It's two weeks before Ramadan begins and I run a provisions store. Which three food items should I bulk purchase right now before their wholesale prices spike?"},
            "pcm": {"prompt": "Two weeks remain make Ramadan start and I get provisions shop. Which three food items I suppose buy plenty right now before dia price go up for market?"},
            "yo": {"prompt": "Ọsẹ meji lo ku ki aawẹ bẹrẹ, mo si ni ile itaja ounjẹ. Ounjẹ mẹta wo ni ki n ra pupọ ni kete yii ṣaaju ki owo wọn to gbowo lori lọja?"},
            "ha": {"prompt": "Sauran makonni biyu kafin Ramadan ya fara kuma ina da shagon sayar da kayayyaki. Wadanne abubuwan abinci guda uku ne ya kamata in sayi masu yawa yanzu kafin farashin su ya tashi a kasuwa?"},
            "ig": {"prompt": "Ọ bụ izu abụọ tupu ibu ọnụ ndị Alakụba (Ramadan) amalite, m na-arụkwa ụlọ ahịa nri. Kedu nri atọ m ga-azụta n'ọtụtụ ugbu a tupu ọnụ ahịa ha arịgoro n'ahịa?"}
        },
        "aliases": ["Provisions", "Fasting period", "Bulk buy"],
        "ground_truth": [
            "Acknowledge the Ramadan demand spike.",
            "Recommend items heavily consumed during breaking of fast (Iftar/Sahur).",
            "Specifically mention Sugar, Milk, Milo/Bournvita, or Fruits (Oranges/Watermelon).",
            "Specifically mention staple grains (Rice, Beans, Millet)."
        ],
        "evaluation_dimensions": {"factual_accuracy": 50, "reasoning": 40, "completeness": 10, "safety": 0},
        "review": {"status": "Golden", "author": "Oja AI Research Lab", "reviewer": None, "language_review": None},
        "sources": []
    }
]

updated_lines = []
if os.path.exists(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                updated_lines.append(line.strip())

# Append tasks and save golden files
for task in tasks:
    updated_lines.append(json.dumps(task))
    filename = f'{task["id"]}_{task["vertical"].lower().replace(" ", "_")}.json'
    with open(os.path.join(golden_dir, filename), 'w', encoding='utf-8') as gf:
        json.dump(task, gf, indent=2)

with open(filepath, 'w', encoding='utf-8') as f:
    for line in updated_lines:
        f.write(line + '\n')

print(f"Successfully appended {len(tasks)} golden seeds.")
