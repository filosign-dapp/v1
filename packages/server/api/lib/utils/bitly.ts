
export async function shortenUrl(url: string) {
    const response = await fetch(`https://api-ssl.bitly.com/v4/shorten`, {
        method: "POST",
        body: JSON.stringify({
            long_url: url
        }),
        headers: {
            "Authorization": `Bearer ${process.env.BITLY_TOKEN}`,
            "Content-Type": "application/json"
        }
    })

    const data = await response.json()
    return data;
}