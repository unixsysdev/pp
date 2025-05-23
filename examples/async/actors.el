// Actor model example
actor Counter {
    let mut count: number = 0;
    
    fn increment() -> number {
        count = count + 1;
        count
    }
    
    fn get_count() -> number {
        count
    }
}

fn main() -> void {
    let counter = spawn_actor(Counter);
    counter.send(increment());
    let result = counter.send(get_count());
    print(result);
}
