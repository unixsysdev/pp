// Promise example in Enterprise Lang
async fn fetchData(url: string) -> Result<string, string> {
    let promise = Http.get(url);
    await promise
}

async fn main() -> void {
    let result = await fetchData("https://api.example.com/data");
    match result {
        Ok(data) => print(data),
        Err(error) => print("Error: " + error)
    }
}
