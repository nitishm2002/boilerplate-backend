CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	name VARCHAR(50),
	mobile_number VARCHAR(15),
	email VARCHAR(50),
	password VARCHAR(100),
	role VARCHAR(255),
	fcm_token TEXT[] DEFAULT ARRAY[]::TEXT[],
	account_status VARCHAR,
	is_verified boolean default false,
    service_category INTEGER[] DEFAULT '{}'
	created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE token(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    email VARCHAR(255),
    otp VARCHAR(255) NOT NULL,
    otp_type VARCHAR(255),
    user_type VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    description TEXT,
    category_id INTEGER  REFERENCES job_categories(id),
    project_size VARCHAR(50) ,
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    work_finish_type VARCHAR(20),
    work_finish_from TIMESTAMPTZ,
    work_finish_to TIMESTAMPTZ,
    location TEXT ,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


/*==================================================etc=======================================================*/

CREATE TABLE job_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO job_categories (name) VALUES
('Kitchen'),
('Bathroom'),
('Plumbing'),
('Electrical'),
('Painting'),
('Flooring'),
('Roofing'),
('Landscaping'),
('General');
alter table users
ADD COLUMN service_category INTEGER[] DEFAULT '{}';

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    description TEXT,
    category_id INTEGER  REFERENCES job_categories(id),
    project_size VARCHAR(50) ,
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    work_finish_type VARCHAR(20),
    work_finish_from TIMESTAMPTZ,
    work_finish_to TIMESTAMPTZ,
    location TEXT ,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


select * from users
UPDATE users
SET fcm_token = (
    SELECT ARRAY_AGG(token)
    FROM UNNEST(fcm_token) AS token
    WHERE token IS NOT NULL
)
WHERE fcm_token IS NOT NULL;








