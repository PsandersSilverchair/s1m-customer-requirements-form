#!/usr/bin/env python3
"""
Script to extract form fields from Word document
"""

try:
    from docx import Document
    import json
    
    def extract_form_fields(docx_path):
        """Extract form fields and their properties from a Word document"""
        doc = Document(docx_path)
        
        form_fields = []
        
        # Look for form fields in the document
        for paragraph in doc.paragraphs:
            # Check if paragraph contains form fields
            for run in paragraph.runs:
                if hasattr(run, 'element'):
                    # Look for form field elements
                    form_field_elements = run.element.xpath('.//w:fldSimple')
                    for field in form_field_elements:
                        field_info = {
                            'type': 'field',
                            'instruction': field.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}instr', ''),
                            'text': run.text
                        }
                        form_fields.append(field_info)
        
        # Look for dropdown/combo box controls
        for element in doc.element.xpath('.//w:sdt'):
            sdt_pr = element.find('.//w:sdtPr')
            if sdt_pr is not None:
                dropdown = sdt_pr.find('.//w:dropDownList')
                combobox = sdt_pr.find('.//w:comboBox')
                
                if dropdown is not None or combobox is not None:
                    field_info = {
                        'type': 'dropdown',
                        'options': []
                    }
                    
                    # Get the options
                    if dropdown is not None:
                        for item in dropdown.findall('.//w:listItem'):
                            display_text = item.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}displayText', '')
                            value = item.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}value', '')
                            field_info['options'].append({
                                'display': display_text,
                                'value': value
                            })
                    
                    if combobox is not None:
                        for item in combobox.findall('.//w:listItem'):
                            display_text = item.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}displayText', '')
                            value = item.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}value', '')
                            field_info['options'].append({
                                'display': display_text,
                                'value': value
                            })
                    
                    # Get the associated text
                    sdt_content = element.find('.//w:sdtContent')
                    if sdt_content is not None:
                        text_content = []
                        for t in sdt_content.findall('.//w:t'):
                            if t.text:
                                text_content.append(t.text)
                        field_info['text'] = ' '.join(text_content)
                    
                    form_fields.append(field_info)
        
        return form_fields
    
    if __name__ == "__main__":
        docx_path = "/Users/psanders/Development/Projects/aiprojects/S1M_CRD-Standard_Version--Jul2025.docx"
        fields = extract_form_fields(docx_path)
        
        print("Found form fields:")
        for i, field in enumerate(fields, 1):
            print(f"\n{i}. Type: {field['type']}")
            if 'text' in field:
                print(f"   Text: {field['text']}")
            if 'options' in field:
                print(f"   Options: {len(field['options'])}")
                for opt in field['options']:
                    print(f"     - {opt['display']} ({opt['value']})")
            if 'instruction' in field:
                print(f"   Instruction: {field['instruction']}")
        
        # Save to JSON file
        with open('/Users/psanders/Development/Projects/aiprojects/customer-requirements-form/extracted_fields.json', 'w') as f:
            json.dump(fields, f, indent=2)
        
        print(f"\nExtracted {len(fields)} form fields")
        print("Results saved to extracted_fields.json")

except ImportError:
    print("python-docx library not found. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'python-docx'])
    print("Please run the script again.")