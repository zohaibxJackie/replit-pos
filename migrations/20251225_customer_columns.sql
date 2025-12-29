--> Added following columns to customers table
ALTER TABLE customers
ADD COLUMN document_type text,
ADD COLUMN document_number text,
ADD COLUMN dob text,
ADD COLUMN nationality text,
ADD COLUMN postal_code text,
ADD COLUMN city text,
ADD COLUMN province text;
