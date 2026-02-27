Cases

title (string)

description (string)

clientId (reference → client)

status (Open / InProgress / Closed)

priority (Low / Medium / High)

caseType (string)

court (string)

startDate (date)

deadline (date)

billableHours (number)

createdAt (date)

Clients

name (string)

email (string)

phone (string)

company (string)

address (string)

createdAt (date)

Tasks

caseId (reference → case)

title (string)

description (string)

assignedTo (string)

status (Todo / InProgress / Done)

priority (Low / Medium / High)

deadline (date)

createdAt (date)

Documents

caseId (reference → case)

name (string)

type (string)

fileUrl (string)

status (Pending / Reviewed / Approved)

uploadedBy (string)

createdAt (date)

Notes

caseId (reference → case)

content (string)

createdBy (string)

createdAt (date)

Activities (timeline)

caseId (reference → case)

type (CASE_CREATED / TASK_ADDED / DOCUMENT_ADDED / STATUS_CHANGED)

message (string)

user (string)

createdAt (date)