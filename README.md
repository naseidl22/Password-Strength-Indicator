
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

Add .txt files to words directory to add new "bad character" (strings that get penalized) strings.

The .txt files should be formatted the same as the repeatedchars.txt

Common passwords/words lists in this format can be found on GitHub or other sites online

Edit files.json to match your directory.

