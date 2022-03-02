/*
Created: 3/2/2022
Modified: 21/2/2022
Project: opus
Model: PostgreSQL 10
Database: PostgreSQL 10
*/

-- Create tables section -------------------------------------------------

-- Table user

CREATE TABLE "user"
(
  "userId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "nick" Character varying(100),
  "email" Character varying(100) NOT NULL,
  "password" Character varying(200) NOT NULL,
  "details" Text,
  "isActive" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone,
  "roleId" Integer,
  "companyId" Integer,
  "personId" Integer
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "user"."userId" IS 'Unique user identificator'
;
COMMENT ON COLUMN "user"."uuid" IS 'Backend autogenerated uuid'
;
COMMENT ON COLUMN "user"."nick" IS 'Nickname for user''s interface'
;
COMMENT ON COLUMN "user"."email" IS 'User''s email for authenticacion, must be unique'
;
COMMENT ON COLUMN "user"."password" IS 'Access password'
;
COMMENT ON COLUMN "user"."details" IS 'Additional details for a user'
;
COMMENT ON COLUMN "user"."isActive" IS 'true: active user
false: inactive user
'
;
COMMENT ON COLUMN "user"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "user"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "user"."deletedAt" IS 'Deletion timestamp'
;

CREATE INDEX "user_role_IX" ON "user" ("roleId")
;

CREATE INDEX "user_company_IX" ON "user" ("companyId")
;

CREATE INDEX "user_person_IX" ON "user" ("personId")
;

ALTER TABLE "user" ADD CONSTRAINT "PK_user" PRIMARY KEY ("userId")
;

ALTER TABLE "user" ADD CONSTRAINT "userId" UNIQUE ("userId")
;

ALTER TABLE "user" ADD CONSTRAINT "userUuid" UNIQUE ("uuid")
;

ALTER TABLE "user" ADD CONSTRAINT "email" UNIQUE ("email")
;

-- Table role

CREATE TABLE "role"
(
  "roleId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "name" Character varying(100) NOT NULL,
  "description" Text NOT NULL,
  "elevation" Smallint DEFAULT 0 NOT NULL,
  "details" Text,
  "isActive" Boolean DEFAULT true NOT NULL,
  "options" Json,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "role"."roleId" IS 'Role identification'
;
COMMENT ON COLUMN "role"."uuid" IS 'Backend unique identificator'
;
COMMENT ON COLUMN "role"."name" IS 'Role name'
;
COMMENT ON COLUMN "role"."description" IS 'Description for the role'
;
COMMENT ON COLUMN "role"."elevation" IS 'In case to use role elevation, the maximun number has more elevation'
;
COMMENT ON COLUMN "role"."details" IS 'Additional details for a user'
;
COMMENT ON COLUMN "role"."isActive" IS 'true: active role
false: inactive role'
;
COMMENT ON COLUMN "role"."options" IS 'An object to store configuration optios for a role'
;
COMMENT ON COLUMN "role"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "role"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "role"."deletedAt" IS 'Deletion timestamp'
;

ALTER TABLE "role" ADD CONSTRAINT "PK_role" PRIMARY KEY ("roleId")
;

ALTER TABLE "role" ADD CONSTRAINT "roleId" UNIQUE ("roleId")
;

ALTER TABLE "role" ADD CONSTRAINT "roleName" UNIQUE ("name")
;

ALTER TABLE "role" ADD CONSTRAINT "roleUuid" UNIQUE ("uuid")
;

-- Table person

CREATE TABLE "person"
(
  "personId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "names" Character varying(200) NOT NULL,
  "lastNames" Character varying(200) NOT NULL,
  "dni" Character varying(100) NOT NULL,
  "phone" Character varying(100),
  "mobilePhone" Character varying(100) NOT NULL,
  "email" Character varying(100),
  "address" Text,
  "reference" Text,
  "birthdate" Date,
  "details" Text,
  "isActive" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "person"."personId" IS 'Unique person identificator'
;
COMMENT ON COLUMN "person"."uuid" IS 'Backend autogenerated identificator'
;
COMMENT ON COLUMN "person"."names" IS 'Names for a person'
;
COMMENT ON COLUMN "person"."lastNames" IS 'Lastnames for a pesons'
;
COMMENT ON COLUMN "person"."dni" IS 'Unique dni number'
;
COMMENT ON COLUMN "person"."phone" IS 'Phone number may includes an extension'
;
COMMENT ON COLUMN "person"."mobilePhone" IS 'Mobile phone this field is mandatory'
;
COMMENT ON COLUMN "person"."email" IS 'Email address for billing'
;
COMMENT ON COLUMN "person"."address" IS 'Residence address'
;
COMMENT ON COLUMN "person"."reference" IS 'References for the address'
;
COMMENT ON COLUMN "person"."birthdate" IS 'Person''s birthdate'
;
COMMENT ON COLUMN "person"."details" IS 'Additional details for the person if its required'
;
COMMENT ON COLUMN "person"."isActive" IS 'true: active person
false: inactive person'
;
COMMENT ON COLUMN "person"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "person"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "person"."deletedAt" IS 'Deletion timestamp'
;

ALTER TABLE "person" ADD CONSTRAINT "PK_person" PRIMARY KEY ("personId")
;

ALTER TABLE "person" ADD CONSTRAINT "personId" UNIQUE ("personId")
;

ALTER TABLE "person" ADD CONSTRAINT "dni" UNIQUE ("dni")
;

ALTER TABLE "person" ADD CONSTRAINT "mobilePhone" UNIQUE ("mobilePhone")
;

ALTER TABLE "person" ADD CONSTRAINT "personUuid" UNIQUE ("uuid")
;

-- Table company

CREATE TABLE "company"
(
  "companyId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "name" Character varying(400) NOT NULL,
  "shortName" Character varying(100),
  "logo" Character varying(500),
  "slogan" Character varying(500),
  "details" Text,
  "isActive" Boolean DEFAULT true NOT NULL,
  "description" Text,
  "createdAt" Timestamp DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp,
  "deletedAt" Timestamp,
  "options" Json
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "company"."companyId" IS 'Company unique identificator'
;
COMMENT ON COLUMN "company"."uuid" IS 'Backend autogenerated identificator'
;
COMMENT ON COLUMN "company"."name" IS 'Company''s name'
;
COMMENT ON COLUMN "company"."shortName" IS 'If apply a short name for the company'
;
COMMENT ON COLUMN "company"."logo" IS 'URL for a logo'
;
COMMENT ON COLUMN "company"."slogan" IS 'If apply, slogan or definition keyword'
;
COMMENT ON COLUMN "company"."details" IS 'Additional details for a company'
;
COMMENT ON COLUMN "company"."isActive" IS 'true: active company
false: inactive company'
;
COMMENT ON COLUMN "company"."description" IS 'Short description for the company'
;
COMMENT ON COLUMN "company"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "company"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "company"."deletedAt" IS 'deletedTimestamp'
;
COMMENT ON COLUMN "company"."options" IS 'Options or configuration JSON file'
;

ALTER TABLE "company" ADD CONSTRAINT "PK_company" PRIMARY KEY ("companyId")
;

ALTER TABLE "company" ADD CONSTRAINT "companyId" UNIQUE ("companyId")
;

ALTER TABLE "company" ADD CONSTRAINT "companyUuid" UNIQUE ("uuid")
;

-- Table client

CREATE TABLE "client"
(
  "clientId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "servicesNumber" Smallint DEFAULT 0 NOT NULL,
  "hasWhatsapp" Boolean DEFAULT false NOT NULL,
  "hasEmail" Boolean DEFAULT false,
  "details" Text,
  "isActive" Boolean DEFAULT true NOT NULL,
  "needsSurvey" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone,
  "companyId" Integer,
  "personId" Integer
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "client"."clientId" IS 'Cliente unique identificator'
;
COMMENT ON COLUMN "client"."uuid" IS 'Backend autogenerate unique identificator'
;
COMMENT ON COLUMN "client"."servicesNumber" IS 'Number of services or number of repairs'
;
COMMENT ON COLUMN "client"."hasWhatsapp" IS 'true: client has whatsapp application
false: client has not whatssapp application'
;
COMMENT ON COLUMN "client"."hasEmail" IS 'true: client has email address
false: client has not email address'
;
COMMENT ON COLUMN "client"."details" IS 'Additional details for the client'
;
COMMENT ON COLUMN "client"."isActive" IS 'true: active client
false: inactive client'
;
COMMENT ON COLUMN "client"."needsSurvey" IS 'true: requires satisfaction survey
false: don''t requires satisfaction survey'
;
COMMENT ON COLUMN "client"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "client"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "client"."deletedAt" IS 'Deletion timestamp'
;

CREATE INDEX "client_company_IX" ON "client" ("companyId")
;

CREATE INDEX "client_person_IX" ON "client" ("personId")
;

ALTER TABLE "client" ADD CONSTRAINT "PK_client" PRIMARY KEY ("clientId")
;

ALTER TABLE "client" ADD CONSTRAINT "clientId" UNIQUE ("clientId")
;

ALTER TABLE "client" ADD CONSTRAINT "clientUuid" UNIQUE ("uuid")
;

-- Table service

CREATE TABLE "service"
(
  "serviceId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "name" Character varying(200) NOT NULL,
  "detail" Text,
  "price" Numeric,
  "isActive" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone,
  "companyId" Integer
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "service"."serviceId" IS 'Unique identificator for a service'
;
COMMENT ON COLUMN "service"."uuid" IS 'Backend autogenerated identificator'
;
COMMENT ON COLUMN "service"."name" IS 'Name for a service'
;
COMMENT ON COLUMN "service"."detail" IS 'Details for the service'
;
COMMENT ON COLUMN "service"."price" IS 'Price for the service'
;
COMMENT ON COLUMN "service"."isActive" IS 'true: active service
false: inactive service'
;
COMMENT ON COLUMN "service"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "service"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "service"."deletedAt" IS 'Deletion timestamp'
;

CREATE INDEX "serice_company_IX" ON "service" ("companyId")
;

ALTER TABLE "service" ADD CONSTRAINT "PK_service" PRIMARY KEY ("serviceId")
;

ALTER TABLE "service" ADD CONSTRAINT "serviceId" UNIQUE ("serviceId")
;

ALTER TABLE "service" ADD CONSTRAINT "serviceUuid" UNIQUE ("uuid")
;

-- Table serviceOrder

CREATE TABLE "serviceOrder"
(
  "serviceOrderId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "number" Numeric NOT NULL,
  "observation" Text NOT NULL,
  "lockPatron" Character varying(100),
  "isFinished" Boolean DEFAULT false NOT NULL,
  "receptionDate" Date DEFAULT current_date NOT NULL,
  "receptionHour" Time DEFAULT current_time NOT NULL,
  "serialNumber" Character varying(80),
  "advancedPayment" Numeric DEFAULT 0 NOT NULL,
  "color" Character varying(20),
  "isRepair" Boolean NOT NULL,
  "techSpecifications" Character varying(400),
  "problemDescription" Text NOT NULL,
  "lockPass" Character varying(200),
  "hasSurvey" Boolean DEFAULT false NOT NULL,
  "isActive" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone,
  "clientId" Integer,
  "modelId" Integer
  --"statusId" Integer
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "serviceOrder"."serviceOrderId" IS 'Unique autogenerated identification'
;
COMMENT ON COLUMN "serviceOrder"."uuid" IS 'Backend autogenerated identificator'
;
COMMENT ON COLUMN "serviceOrder"."number" IS 'Unique secuencial number'
;
COMMENT ON COLUMN "serviceOrder"."observation" IS 'Device''s reception observaciones'
;
COMMENT ON COLUMN "serviceOrder"."lockPatron" IS 'Lock patron array for unlock the device'
;
COMMENT ON COLUMN "serviceOrder"."isFinished" IS 'true: the work is finised,
false: the work is not finished'
;
COMMENT ON COLUMN "serviceOrder"."receptionDate" IS 'Date for reception'
;
COMMENT ON COLUMN "serviceOrder"."receptionHour" IS 'Reception hour'
;
COMMENT ON COLUMN "serviceOrder"."serialNumber" IS 'Serial number fot the deice'
;
COMMENT ON COLUMN "serviceOrder"."advancedPayment" IS 'Advace payment for the service (for the total amount)'
;
COMMENT ON COLUMN "serviceOrder"."color" IS 'Color of the device'
;
COMMENT ON COLUMN "serviceOrder"."isRepair" IS 'true: is a repair
false: is a maintenace'
;
COMMENT ON COLUMN "serviceOrder"."techSpecifications" IS 'Technical specification'
;
COMMENT ON COLUMN "serviceOrder"."problemDescription" IS 'Description of the problem'
;
COMMENT ON COLUMN "serviceOrder"."lockPass" IS 'Unlock access password'
;
COMMENT ON COLUMN "serviceOrder"."hasSurvey" IS 'true: a survey was sent
false: the surve has not sent yet'
;
COMMENT ON COLUMN "serviceOrder"."isActive" IS 'true: active service order
false: inactive service order'
;
COMMENT ON COLUMN "serviceOrder"."createdAt" IS 'Created timestamp'
;
COMMENT ON COLUMN "serviceOrder"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "serviceOrder"."deletedAt" IS 'Deleted timestamp'
;

CREATE INDEX "order_client_IX" ON "serviceOrder" ("clientId")
;

CREATE INDEX "order_model_IX" ON "serviceOrder" ("modelId")
;

--CREATE INDEX "order_status_IX" ON "serviceOrder" ("statusId")
--;

ALTER TABLE "serviceOrder" ADD CONSTRAINT "PK_serviceOrder" PRIMARY KEY ("serviceOrderId")
;

ALTER TABLE "serviceOrder" ADD CONSTRAINT "serviceOrderId" UNIQUE ("serviceOrderId")
;

ALTER TABLE "serviceOrder" ADD CONSTRAINT "number" UNIQUE ("number")
;

ALTER TABLE "serviceOrder" ADD CONSTRAINT "orderUuid" UNIQUE ("uuid")
;

-- Table brand

CREATE TABLE "brand"
(
  "brandId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "name" Character varying(100) NOT NULL,
  "shortName" Character varying(50),
  "description" Text,
  "url" Character varying(400),
  "isActive" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "brand"."brandId" IS 'Brand''s unique identificator'
;
COMMENT ON COLUMN "brand"."uuid" IS 'Unique backend autogenerated code'
;
COMMENT ON COLUMN "brand"."name" IS 'Unique name for a brand'
;
COMMENT ON COLUMN "brand"."shortName" IS 'If a brand has a short name'
;
COMMENT ON COLUMN "brand"."description" IS 'Description of the brand'
;
COMMENT ON COLUMN "brand"."url" IS 'Main URL of the brand'
;
COMMENT ON COLUMN "brand"."isActive" IS 'true: active brand
false: inactive brand'
;
COMMENT ON COLUMN "brand"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "brand"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "brand"."deletedAt" IS 'Deletion timestamp'
;

ALTER TABLE "brand" ADD CONSTRAINT "PK_brand" PRIMARY KEY ("brandId")
;

ALTER TABLE "brand" ADD CONSTRAINT "brandId" UNIQUE ("brandId")
;

ALTER TABLE "brand" ADD CONSTRAINT "brandName" UNIQUE ("name")
;

ALTER TABLE "brand" ADD CONSTRAINT "brandUuid" UNIQUE ("uuid")
;

-- Table model

CREATE TABLE "model"
(
  "modelId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "name" Character varying(150) NOT NULL,
  "description" Text,
  "shortName" Character varying(50),
  "techSpecification" Text NOT NULL,
  "img" Character varying(400),
  "url" Character varying(400),
  "isActive" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone,
  "brandId" Integer
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "model"."modelId" IS 'Unique utogenerated identificator for a model'
;
COMMENT ON COLUMN "model"."uuid" IS 'Unique backend autogenerated code'
;
COMMENT ON COLUMN "model"."name" IS 'Name for the moteñ'
;
COMMENT ON COLUMN "model"."description" IS 'Description for the model'
;
COMMENT ON COLUMN "model"."shortName" IS 'If the model has a short name'
;
COMMENT ON COLUMN "model"."techSpecification" IS 'Technical specification for the model'
;
COMMENT ON COLUMN "model"."img" IS 'URL for the image'
;
COMMENT ON COLUMN "model"."url" IS 'Official URL for the model if it has'
;
COMMENT ON COLUMN "model"."isActive" IS 'true: active model
false: inactive model'
;
COMMENT ON COLUMN "model"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "model"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "model"."deletedAt" IS 'Deleted timestamp'
;

CREATE INDEX "model_brand_IX" ON "model" ("brandId")
;

ALTER TABLE "model" ADD CONSTRAINT "PK_model" PRIMARY KEY ("modelId")
;

ALTER TABLE "model" ADD CONSTRAINT "modelId" UNIQUE ("modelId")
;

ALTER TABLE "model" ADD CONSTRAINT "modelName" UNIQUE ("name")
;

ALTER TABLE "model" ADD CONSTRAINT "modelUuid" UNIQUE ("uuid")
;

-- Table serviceDetail

CREATE TABLE "serviceDetail"
(
  "serviceDetailId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "cost" Numeric DEFAULT 0 NOT NULL,
  "balance" Numeric,
  "details" Text,
  "isActive" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone,
  "serviceId" Integer,
  "serviceOrderId" Integer
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "serviceDetail"."serviceDetailId" IS 'Unique autogenerated identificator'
;
COMMENT ON COLUMN "serviceDetail"."uuid" IS 'Backend autogenerated unique identificator'
;
COMMENT ON COLUMN "serviceDetail"."cost" IS 'Total cost of the service'
;
COMMENT ON COLUMN "serviceDetail"."balance" IS 'Balance = total cost - advanced payment'
;
COMMENT ON COLUMN "serviceDetail"."details" IS 'Additional details of the service'
;
COMMENT ON COLUMN "serviceDetail"."isActive" IS 'true: active service details
false: inactive service details'
;
COMMENT ON COLUMN "serviceDetail"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "serviceDetail"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "serviceDetail"."deletedAt" IS 'Deletion timestamp'
;

CREATE INDEX "details_service_IX" ON "serviceDetail" ("serviceId")
;

CREATE INDEX "detail_order_IX" ON "serviceDetail" ("serviceOrderId")
;

ALTER TABLE "serviceDetail" ADD CONSTRAINT "PK_serviceDetail" PRIMARY KEY ("serviceDetailId")
;

ALTER TABLE "serviceDetail" ADD CONSTRAINT "serviceDetailsId" UNIQUE ("serviceDetailId")
;

ALTER TABLE "serviceDetail" ADD CONSTRAINT "uuid" UNIQUE ("uuid")
;

-- Table serviceStatus

CREATE TABLE "serviceStatus"
(
  "statusId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "name" Character varying(200) NOT NULL,
  "details" Text,
  "order" Smallint,
  "cost" Numeric DEFAULT 0,
  "options" Json,
  "isActive" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone,
  "companyId" Integer
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "serviceStatus"."statusId" IS 'Unique autogenerated identificator for the status'
;
COMMENT ON COLUMN "serviceStatus"."uuid" IS 'Unique backend autogenerated identificator'
;
COMMENT ON COLUMN "serviceStatus"."name" IS 'Name for the status'
;
COMMENT ON COLUMN "serviceStatus"."details" IS 'Additional details for the status'
;
COMMENT ON COLUMN "serviceStatus"."order" IS 'If apply, uses an order for automatic assignation of the status'
;
COMMENT ON COLUMN "serviceStatus"."cost" IS 'If the status has a cost'
;
COMMENT ON COLUMN "serviceStatus"."options" IS 'Options for the status in JSON format'
;
COMMENT ON COLUMN "serviceStatus"."isActive" IS 'true: active status
false: inactive status'
;
COMMENT ON COLUMN "serviceStatus"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "serviceStatus"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "serviceStatus"."deletedAt" IS 'Deletion timestamp'
;

CREATE INDEX "serviceStatus_company_IX" ON "serviceStatus" ("companyId")
;

ALTER TABLE "serviceStatus" ADD CONSTRAINT "PK_serviceStatus" PRIMARY KEY ("statusId")
;

ALTER TABLE "serviceStatus" ADD CONSTRAINT "statusId" UNIQUE ("statusId")
;

ALTER TABLE "serviceStatus" ADD CONSTRAINT "statusName" UNIQUE ("name")
;

ALTER TABLE "serviceStatus" ADD CONSTRAINT "statusUuid" UNIQUE ("uuid")
;

-- Table statusChange

CREATE TABLE "statusChange"
(
  "statusChangeId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "uuid" Character varying(10) NOT NULL,
  "details" Text,
  "sysDetail" Text,
  "isCompleted" Boolean DEFAULT false NOT NULL,
  "isActive" Boolean DEFAULT true NOT NULL,
  "statusId" Integer,
  "serviceOrderId" Integer,
  "userId" Integer
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "statusChange"."statusChangeId" IS 'Unique autogenerated identificator'
;
COMMENT ON COLUMN "statusChange"."createdAt" IS 'Creation timestamp'
;
COMMENT ON COLUMN "statusChange"."details" IS 'Details or information about the status change'
;
COMMENT ON COLUMN "statusChange"."uuid" IS 'Unique backend autogenerated identificator'
;
COMMENT ON COLUMN "statusChange"."sysDetail" IS 'Backend sent details'
;
COMMENT ON COLUMN "statusChange"."isCompleted" IS 'true: The status was completed
false: The status is not complete or is still in progress'
;
COMMENT ON COLUMN "statusChange"."isActive" IS 'true: active service order
false inactive service order'
;

CREATE INDEX "statusChange_status_IX" ON "statusChange" ("statusId")
;

CREATE INDEX "statusChange_order_IX" ON "statusChange" ("serviceOrderId")
;

CREATE INDEX "statusChange_user_IX" ON "statusChange" ("userId")
;

ALTER TABLE "statusChange" ADD CONSTRAINT "PK_statusChange" PRIMARY KEY ("statusChangeId")
;

ALTER TABLE "statusChange" ADD CONSTRAINT "statusChangeId" UNIQUE ("statusChangeId")
;

ALTER TABLE "statusChange" ADD CONSTRAINT "changeUuid" UNIQUE ("uuid")
;

-- Table survey

CREATE TABLE "survey"
(
  "surveyId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "name" Character varying(200) NOT NULL,
  "details" Text,
  "startDate" Date DEFAULT current_date NOT NULL,
  "endDate" Date,
  "startHour" Time with time zone DEFAULT current_time NOT NULL,
  "endHour" Time with time zone DEFAULT '00:00:00-05'::time with time zone NOT NULL,
  "isActive" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone,
  "companyId" Integer
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "survey"."surveyId" IS 'Unique autogenerated identificator for a survey'
;
COMMENT ON COLUMN "survey"."uuid" IS 'Backend autogenerated code'
;
COMMENT ON COLUMN "survey"."name" IS 'Name for a survey, this field is mandatory'
;
COMMENT ON COLUMN "survey"."details" IS 'Additional details like the purpose of the survey, target audience, etc.'
;
COMMENT ON COLUMN "survey"."startDate" IS 'Date of start to send the survey'
;
COMMENT ON COLUMN "survey"."endDate" IS 'Date to end the survey, if this field is empty, the survey has no end'
;
COMMENT ON COLUMN "survey"."startHour" IS 'Hour limit to start sending the survey to the customers'
;
COMMENT ON COLUMN "survey"."endHour" IS 'Hour limit to end sending the survey to the customers in a day'
;
COMMENT ON COLUMN "survey"."isActive" IS 'true: active survey
false: inactive survey'
;
COMMENT ON COLUMN "survey"."createdAt" IS 'Created timestamp'
;
COMMENT ON COLUMN "survey"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "survey"."deletedAt" IS 'Deletion timestamp'
;

CREATE INDEX "survey_company_IX" ON "survey" ("companyId")
;

ALTER TABLE "survey" ADD CONSTRAINT "PK_survey" PRIMARY KEY ("surveyId")
;

ALTER TABLE "survey" ADD CONSTRAINT "surveyId" UNIQUE ("surveyId")
;

ALTER TABLE "survey" ADD CONSTRAINT "surveyUuid" UNIQUE ("uuid")
;

-- Table question

CREATE TABLE "question"
(
  "questionId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "uuid" Character varying(10) NOT NULL,
  "question" Text NOT NULL,
  "answer" Text[] NOT NULL,
  "isActive" Boolean DEFAULT true NOT NULL,
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone,
  "details" Text
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "question"."questionId" IS 'Unique autogenerated identificator '
;
COMMENT ON COLUMN "question"."uuid" IS 'Unique bakend autogenerated identificator'
;
COMMENT ON COLUMN "question"."question" IS 'Question of the survey'
;
COMMENT ON COLUMN "question"."answer" IS 'Answer or correct answers for the question, answer must be send in array format'
;
COMMENT ON COLUMN "question"."isActive" IS 'true: active question
false: inactive question'
;
COMMENT ON COLUMN "question"."createdAt" IS 'Created timestamp'
;
COMMENT ON COLUMN "question"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "question"."deletedAt" IS 'Deletion timestamp'
;
COMMENT ON COLUMN "question"."details" IS 'Additional details if it applies'
;

ALTER TABLE "question" ADD CONSTRAINT "PK_question" PRIMARY KEY ("questionId")
;

ALTER TABLE "question" ADD CONSTRAINT "questionId" UNIQUE ("questionId")
;

ALTER TABLE "question" ADD CONSTRAINT "questionUuid" UNIQUE ("uuid")
;

-- Table surveyQuestion

CREATE TABLE "surveyQuestion"
(
  "surveyQuestionId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1),
  "createdAt" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "updatedAt" Timestamp with time zone,
  "deletedAt" Timestamp with time zone,
  "isActive" Boolean DEFAULT true NOT NULL,
  "surveyId" Integer,
  "questionId" Integer
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "surveyQuestion"."surveyQuestionId" IS 'Unique autogenerated identificator'
;
COMMENT ON COLUMN "surveyQuestion"."createdAt" IS 'Created timestamp'
;
COMMENT ON COLUMN "surveyQuestion"."updatedAt" IS 'Updated timestamp'
;
COMMENT ON COLUMN "surveyQuestion"."deletedAt" IS 'Deletion timestamp'
;
COMMENT ON COLUMN "surveyQuestion"."isActive" IS 'true: active survey - question join
false: inactive survey - question join'
;

CREATE INDEX "surveQuestion_survey_IX" ON "surveyQuestion" ("surveyId")
;

CREATE INDEX "surveyQuestion_question_IX" ON "surveyQuestion" ("questionId")
;

ALTER TABLE "surveyQuestion" ADD CONSTRAINT "PK_surveyQuestion" PRIMARY KEY ("surveyQuestionId")
;

ALTER TABLE "surveyQuestion" ADD CONSTRAINT "surveyQuestionsId" UNIQUE ("surveyQuestionId")
;

-- Table session

CREATE TABLE "session"
(
  "userId" Integer NOT NULL,
  "uuid" Character varying(10) NOT NULL,
  "opts" Text NOT NULL,
  "isRenewed" Boolean DEFAULT false NOT NULL,
  "activeSince" Timestamp with time zone DEFAULT current_timestamp NOT NULL,
  "renewedSince" Timestamp with time zone,
  "details" Text,
  "sessionId" Integer NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 1)
)
WITH (
  autovacuum_enabled=true)
;
COMMENT ON COLUMN "session"."userId" IS 'User identificator'
;
COMMENT ON COLUMN "session"."uuid" IS 'Unique backend autogenerated identificator'
;
COMMENT ON COLUMN "session"."opts" IS 'Token information'
;
COMMENT ON COLUMN "session"."isRenewed" IS 'true: Token renewed
false: Token not renewed yet'
;
COMMENT ON COLUMN "session"."activeSince" IS 'Timestamp for the login date and time'
;
COMMENT ON COLUMN "session"."renewedSince" IS 'Timestamp for the renewed date and time'
;
COMMENT ON COLUMN "session"."details" IS 'Information or additional details'
;
COMMENT ON COLUMN "session"."sessionId" IS 'Autogenerated identificator for the session'
;

CREATE INDEX "session_user_IX" ON "session" ("userId")
;

ALTER TABLE "session" ADD CONSTRAINT "PK_session" PRIMARY KEY ("sessionId")
;

ALTER TABLE "session" ADD CONSTRAINT "sessionId" UNIQUE ("sessionId")
;

ALTER TABLE "session" ADD CONSTRAINT "sessionUuid" UNIQUE ("uuid")
;

-- Create foreign keys (relationships) section -------------------------------------------------

ALTER TABLE "user"
  ADD CONSTRAINT "usr_has_rol_FL"
    FOREIGN KEY ("roleId")
    REFERENCES "role" ("roleId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "user"
  ADD CONSTRAINT "usr_belongs_cpn_FK"
    FOREIGN KEY ("companyId")
    REFERENCES "company" ("companyId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "user"
  ADD CONSTRAINT "usr_is_per_FK"
    FOREIGN KEY ("personId")
    REFERENCES "person" ("personId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "client"
  ADD CONSTRAINT "cmp_has_cli_FK"
    FOREIGN KEY ("companyId")
    REFERENCES "company" ("companyId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "client"
  ADD CONSTRAINT "cli_is_per_FK"
    FOREIGN KEY ("personId")
    REFERENCES "person" ("personId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "service"
  ADD CONSTRAINT "cmp_has_ser_FK"
    FOREIGN KEY ("companyId")
    REFERENCES "company" ("companyId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "serviceOrder"
  ADD CONSTRAINT "ord_isFor_cli_FK"
    FOREIGN KEY ("clientId")
    REFERENCES "client" ("clientId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "model"
  ADD CONSTRAINT "bra_has_mod_FK"
    FOREIGN KEY ("brandId")
    REFERENCES "brand" ("brandId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "serviceOrder"
  ADD CONSTRAINT "ser_has_mod_FK"
    FOREIGN KEY ("modelId")
    REFERENCES "model" ("modelId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "serviceStatus"
  ADD CONSTRAINT "cpn_has_sst_FK"
    FOREIGN KEY ("companyId")
    REFERENCES "company" ("companyId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

--ALTER TABLE "serviceOrder"
--  ADD CONSTRAINT "ser_has_sst_FK"
--    FOREIGN KEY ("statusId")
--    REFERENCES "serviceStatus" ("statusId")
--      ON DELETE NO ACTION
--      ON UPDATE NO ACTION
--;

ALTER TABLE "statusChange"
  ADD CONSTRAINT "chg_has_sts_FK"
    FOREIGN KEY ("statusId")
    REFERENCES "serviceStatus" ("statusId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "statusChange"
  ADD CONSTRAINT "ord_has_chg_FK"
    FOREIGN KEY ("serviceOrderId")
    REFERENCES "serviceOrder" ("serviceOrderId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "statusChange"
  ADD CONSTRAINT "chg_req_usr_FK"
    FOREIGN KEY ("userId")
    REFERENCES "user" ("userId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "surveyQuestion"
  ADD CONSTRAINT "svy_has_qst_FK"
    FOREIGN KEY ("surveyId")
    REFERENCES "survey" ("surveyId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "surveyQuestion"
  ADD CONSTRAINT "qtn_belongsTo_svy_FK"
    FOREIGN KEY ("questionId")
    REFERENCES "question" ("questionId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "survey"
  ADD CONSTRAINT "cpn_mayHas_svy_FK"
    FOREIGN KEY ("companyId")
    REFERENCES "company" ("companyId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "session"
  ADD CONSTRAINT "usr_has_ses_FK"
    FOREIGN KEY ("userId")
    REFERENCES "user" ("userId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "serviceDetail"
  ADD CONSTRAINT "det_has_service_FK"
    FOREIGN KEY ("serviceId")
    REFERENCES "service" ("serviceId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "serviceDetail"
  ADD CONSTRAINT "srv_has_det_FK"
    FOREIGN KEY ("serviceOrderId")
    REFERENCES "serviceOrder" ("serviceOrderId")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE "serviceDetail"
    ADD CONSTRAINT "order_service_UQ" UNIQUE ("serviceId", "serviceOrderId");

ALTER TABLE "statusChange"
    ADD CONSTRAINT "status_order_UQ" UNIQUE ("statusId", "serviceOrderId");