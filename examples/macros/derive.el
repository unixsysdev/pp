// Derive macro example

#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: number,
    y: number
}

fn main() -> void {
    let p1 = Point { x: 1.0, y: 2.0 };
    let p2 = p1.clone();
    
    if p1 == p2 {
        print("Points are equal");
    }
    
    print(p1.debug());
}
