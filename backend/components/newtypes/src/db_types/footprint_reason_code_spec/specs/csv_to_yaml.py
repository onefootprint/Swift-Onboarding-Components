import pandas as pd
import yaml
from collections import defaultdict
from pathlib import Path

def process_csv_to_yaml(csv_file):
    # Read the CSV file
    df = pd.read_csv(csv_file)
    
    # Group by RSG
    rsg_groups = df.groupby('RSG')
    
    # Process each RSG group
    for rsg_name, group in rsg_groups:
        if not rsg_name or pd.isna(rsg_name):  # Skip empty RSG values
            continue
            
        # Create the structure for this RSG
        yaml_structure = {'categories': []}
        
        # Group by category and subcategory
        category_groups = group.groupby(['category', 'subcategory'])
        
        # Track categories to avoid duplicates
        categories_dict = {}
        
        for (category, subcategory), subgroup in category_groups:
            if not category or pd.isna(category) or not subcategory or pd.isna(subcategory):
                continue
                
            # Clean category and subcategory names
            category = category.strip().lower()
            subcategory = subcategory.strip().lower()
            
            # Get reason codes for this subcategory
            reason_codes = [code for code in subgroup['footprint_reason_code'] if code and not pd.isna(code)]
            
            # If category doesn't exist in our tracking dict, create it
            if category not in categories_dict:
                categories_dict[category] = {
                    'name': category,
                    'sub_categories': []
                }
                
            # Add subcategory to the category
            categories_dict[category]['sub_categories'].append({
                'name': subcategory,
                'reason_codes': reason_codes
            })
            
            # Sort subcategories to put "Overall" first
            categories_dict[category]['sub_categories'].sort(
                key=lambda x: (0 if x['name'].lower() == 'overall' else 1, x['name'])
            )
        
        # Sort categories to put "Overall" first if it exists
        categories_list = list(categories_dict.values())
        # Find and move "Overall" category to the front if it exists
        for i, category in enumerate(categories_list):
            if category['name'].lower() == 'overall':
                categories_list.insert(0, categories_list.pop(i))
                break
                
        yaml_structure['categories'] = categories_list
        
        # Create output directory if it doesn't exist
        output_dir = Path('yaml_output')
        output_dir.mkdir(exist_ok=True)
        
        # Write YAML file
        output_file = output_dir / f'{rsg_name.lower()}.yaml'
        with open(output_file, 'w') as f:
            yaml.dump(yaml_structure, f, sort_keys=False, allow_unicode=True)
        
        print(f"Generated {output_file}")

def main():
   # CSV has 
   #   - RSG column (corresponds to each individual file)
   #   - category column
   #   - subcategory column
   #   - footprint_reason_code column
    parser = argparse.ArgumentParser(description='Convert FRC CSV file to YAML format')
    parser.add_argument('csv_file', help='Path to the CSV file (default: frc_2025.csv)')
    
    args = parser.parse_args()
    
    process_csv_to_yaml(args.csv_file)
    print("YAML generation complete!")

if __name__ == "__main__":
    main()