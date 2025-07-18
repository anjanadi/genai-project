# import openai
# import os

# openai.api_key = os.getenv("OPENAI_API_KEY")

# def generate_campaign(product, audience, tone, language, details):
#     prompt = (
#         f"Generate a marketing campaign in {language} for a product '{product}'.\n"
#         f"Audience: {audience}\nTone: {tone}\nDetails: {details}\n\n"
#         f"Include:\n- A compelling ad copy\n- A short social media post\n- A motivational quote\n"
#         f"Format output clearly in sections."
#     )

#     response = openai.ChatCompletion.create(
#         model="gpt-3.5-turbo",  # Use "gpt-4" if your key supports it
#         messages=[{"role": "user", "content": prompt}],
#         temperature=0.7
#     )

#     content = response.choices[0].message.content.strip()

#     # Optional: Basic section parsing (you can enhance this as needed)
#     ad_copy = content
#     social_media = f"{product} — Check this out! #campaign"
#     quote = "Your campaign starts here."

#     return {
#         "ad_copy": ad_copy,
#         "social_media": social_media,
#         "quote": quote,
#         "image_url": None
#     }
import openai
import os
import urllib.parse

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_campaign(product, audience, tone, language, details):
    prompt = (
        f"Generate a marketing campaign in {language} for a product '{product}'.\n"
        f"Audience: {audience}\nTone: {tone}\nDetails: {details}\n\n"
        f"Include:\n- A compelling ad copy\n- A short social media post\n- A motivational quote\n"
        f"Format output clearly in sections."
    )

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # Use "gpt-4" if your key supports it
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    content = response.choices[0].message.content.strip()

    # Use URL-encoded query for Google Images search
    search_query = urllib.parse.quote(f"{tone} {product}")
    image_url = f"https://www.google.com/search?tbm=isch&q={search_query}"

    return {
        "ad_copy": content,
        "social_media": f"{product} — Check this out! #campaign",
        "quote": "Your campaign starts here.",
        "image_url": image_url
    }
