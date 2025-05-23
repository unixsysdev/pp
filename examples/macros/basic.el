// Basic macro examples

// Simple function-like macro
macro_rules! square {
    ($x:expr) => {
        $x * $x
    };
}

// Repetition macro
macro_rules! vec {
    ($($element:expr),*) => {
        {
            let mut array = Array.new();
            $(array.push($element);)*
            array
        }
    };
}

fn main() -> void {
    let x = square!(5);
    print(x); // Prints 25
    
    let numbers = vec![1, 2, 3, 4, 5];
    print(numbers.length()); // Prints 5
}
