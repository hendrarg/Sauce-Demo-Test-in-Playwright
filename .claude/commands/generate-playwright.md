# Generate Playwright

## Overview
Comprehensive checklist for generate playwright

### To do list
- [ ] Analyze test case
- [ ] Identify the related page/screen for each test step
- [ ] Create Page Object Model first Check whether the Page Object Model (POM) already exists
	•	If not exists, create a new Page Object file
	•	If exists, reuse the existing Page Object
- [ ] Create Locator first Check whether the required locator already exists in the related Page Object
	•	If not exists, generate a new locator
	•	If exists, review the locator against current UI
	•	If locator is still valid and unchanged → reuse existing locator
	•	If locator has changed → update locator with the latest selector
- [ ] Create Method first Check whether the related method/action already exists in Page Object
	•	If not exists, create a new method
	•	If exists, use existing and dont create again
	•	Ensure method responsibility is clear and reusable
	•	Avoid business logic duplication across methods
- [ ] Create API method if the test case provide curl for precondition
	•	If no curl provide use existing api method if test case need some precondition with API
	•   If no precondition with API just go with next task
	•   Store base payload on existing folder
	•   Create types for API request and response
	• 	Generate best practice API method for playwright and typescript testing based on the docs/api file mentioned by the user (01-api-tanpa-builder.md | 02-api-builder-dengan-config.md | 03-api-builder-tanpa-config.md)
- [ ] Create spec file based on test case using Page Object Model, Fixture, Storage State and Other Best Practice Playwright in this project