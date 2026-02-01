-- Update the check constraint for custom_section_elements to allow new types
-- Drop the existing constraint
ALTER TABLE custom_section_elements DROP CONSTRAINT IF EXISTS custom_section_elements_element_type_check;

-- Add the new updated constraint with all current and new types supported
ALTER TABLE custom_section_elements ADD CONSTRAINT custom_section_elements_element_type_check 
CHECK (element_type IN (
    'gallery', 
    'text_box', 
    'card', 
    'image', 
    'video', 
    'image_carousel', 
    'qr_code', 
    'list', 
    'button', 
    'table'
));
