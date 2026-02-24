
# Password Strength Indicator

Password strength evaluation tool that runs directly in browser.

## How It Works

The tool evaluates passwords by:
1. Checking character set diversity (lowercase, uppercase, numbers, special characters)
2. Scanning for matches against common word lists, characters that match common strings are heavily penalized
3. Calculating entropy: `goodCharacters × log₂(charsetSize)`
4. Scoring based on time required to crack based on entropy value (estimated at 100+ years = perfect score)

## Usage

Download zip and run as live server in web browser. 


