---
modified: '2025-03-22T02:04:54.050Z'
---

# Technical overview to implementing Open Referral UK

## Introduction

This document gives insight into the implementation of Open Referral UK (ORUK), a data standard supported by the Ministry of Housing, Communities & Local Government. It offers a high level technical understanding of the proposition, benefits, issues and requirements. This document does not provide the [full technical specifications](https://github.com/OpenReferralUK/uk-profile), but it points to where details can be found.

It is accompanied by an [ORUK Executive summary](/adopt/01_summary) for senior managers, an [ORUK Business case](/adopt/02_business_case) for finance managers and an [ORUK project initiation document (PID)](/adopt/03_pid) for project managers.

## 1. Background on ORUK

Local councils currently need to collate information which describes the what, where and when of local services for supporting Adult Social Care, Families and children with Special Educational Needs & Disabilities (SEND).

Other sectors in the same council area—NHS, charities,Housing, Police, Fire, The Voluntary, Community, Faith and Social Enterprise—also need access to local support information. This information is collected by many different teams, departments and organisations in various data formats using some software but mainly spreadsheets. The data is not pulled together or easily shared across organisations. This results in data duplication, inefficiency, and reduces data quality and trust that it is accurate.

A unified data standard could enable all sectors to contribute to and access a shared repository, eliminating duplication and improving data quality. This approach would increase efficiency and provide more accurate local service information. This document outlines an implementation of the UK Government endorsed international data standard HSDS v3.0, or Open Referral, providing guidance for councils on establishing the technical infrastructure needed in their areas.

Open Referral UK (ORUK) has been approved by the Central Digital and Data Office’s (CDDO) Data Standards Authority and endorsed for use across government.

ORUK is the UK's implementation of the international Human Services Data Standard 3.0 (HSDSv3.0). For more details, see the [Overview and Model](http://docs.openreferral.org/en/latest/hsds/overview.html) in the Open Referral Data Specifications 3.0.1 documentation.

To learn more about ORUK's application and potential cost savings for councils, visit Ministry of Housing, Communities & Local Government’s (MHCLG’s) blog post on [Driving Adoption of Open Referral UK](https://mhclgdigital.blog.gov.uk/2024/03/06/driving-adoption-of-open-referral-uk-to-deliver-millions-in-annual-savings-for-councils/).

## 2. The case for data standards

There is a clear need for greater interoperability across public and third-sector organisations, as they often engage with the same citizens without necessarily being aware of it. While the General Data Protection Regulation (GDPR) and the Data Protection Act (DPA) regulate personal data re-use, it is technology—not policy—that sometimes limits data sharing across organisations.

This can happen when data is too closely linked to a specific application or process, making it difficult to extract. Data standards enable the decoupling of data from the application. Such an approach lets users select the applications they prefer and switch more easily if needed. It also allows data to be sent to other applications that understand the same format.

While a data standard may not cover every data need, a well-defined standard can capture core information while allowing organisations to manage and share additional data.

The Open Referral UK data standard enables the formation of an interoperable directory of services across council area partner organisations using a core set of data processed by whichever software an organisation chooses to use. It doesn’t include personal data making it easier to adopt and share the data with different organisations for the different needs of residents.

Using the data standard will reduce the cost of collecting data, make the assurance more efficient and effective and provide more accurate data improving access to community support and so reducing reliance on public sector services.

## 3. Outline Implementation model

The model below outlines the anticipated framework for implementing ORUK - data collection, a common data assurance process, an API for sharing/extracting data, and a goal for broad re-use of the data in various ways. More details of this can be found in the [ORUK Project initiation document](/adopt/03_pid) provided to help council project managers. We advise starting with a simple proof of concept before scaling, given the complexity of involving stakeholders.

<img style="margin-bottom:2rem" src="/implementation_model.svg" alt="A flowchart depicting the steps described below" />

_Figure 1: Data flow process from collection to re-use_

### 3.1 Collect & manage data

This involves gathering the information that describes a local service using the data standard ORUK <span style="font-weight: 800">[(see data fields here)](/developers/schemata)</span>. Councils can either develop their own application or purchase compliant software from suppliers listed by ORUK. There are various methods to collect data but the council should identify whichever is the easiest to prove the concept. Councils will have to offer a broader set of options when looking to scale this up.

The diagram below provides a high-level overview of the main entities in ORUK.

<img style="margin-bottom:2rem" src="/entities.svg" alt="A diagram depicting the key five entities" />

_Figure 2: Overview of the main ORUK entities_

### 3.2 Assure data quality

The aim of assurance is to ensure there is a master record and to check that the data is accurate and can be trusted by those wanting to use it.

**Note**, ORUK includes an [accreditations field](/developers/schemata) (under the Service entity table) to record service quality e.g. Ofsted, CQC but assurance is only concerned with the data describing the service rather than the quality of the service.

There are three main considerations:

The first is to remove duplication. If data is collected from several different sources there will be duplication. A simple semi-automated step would be to sort the collection of data using fields that are likely to be the same if it is the same service e.g. name, provider, venue, contact details. It would then be a manual step by an assurer to filter out duplicates.

The second is to check the data quality. This will be about:

- richness of data i.e. to complete all the fields that are deemed necessary,
- accuracy i.e. to check that days and times for sessions have not changed
- verification i.e. to ensure that an accreditation say of Ofsted is valid.

If the collection adheres to the council area policy for the data then this will minimise the assurance workload.

The assurer’s email address will be added to the record so that any consumer will know who is accountable and where to report any errors.

The third is to ensure that the taxonomies are appropriately applied. It will be the taxonomies that will enable the service to be matched to a resident’s needs. See [section 4](#4._working_with_taxonomies) below.

### 3.3. Publish

The main method for making the data available for reuse is to provide an API.

Other options could be to provide CSV of the data, PDF templates presenting the data or as links to present the data but these should only be considered when scaling the implementation.

ORUK API has RESTful web services documented according to the OpenAPI standard. Key web methods are:

- <code>/</code> Information about the API version (its publisher, version number and profile)
- <code>/services</code> and <code>/services/{id}</code> List and detailed service information.
- <code>/service_at_locations</code> and <code>/service_at_locations/{id}</code> Services
  available at a location.
- <code>/taxonomies</code> and <code>/taxonomies/{id}</code> Taxonomies referenced by the data and
  their details
- </code>/taxonomy_terms</code> and <code>/taxonomy_terms/{id}</code> List of taxonomy terms and details of a specified taxonomy term

Version 3.0 has nine GET web methods. See the [API page](/developers/api) and [Swagger documentation](https://docs.openreferral.org/en/latest/openapi.html).

#### Custom APIs

Publishers may offer additional web methods or information beyond the standard requirements.

#### Check your API

You can [check your ORUK compliance](/developers/validator) to see if the data feed you're providing meets the Open Referral UK standard. This tool provides pass/fail results, as well as warnings and suggestions for improvement. Only APIs that return a ‘pass’ result will be included in the [verified feed directory](/community/directory). We recommended that procurement teams contractually require suppliers to maintain a verified feed to ensure compliance with ORUK.

### 3.4 Re-use

The purpose of collecting, assuring and publishing the data is so that it can be used to support many different resident needs. Currently it is likely to only be used in a Directory of Services but it has the potential to be reused or integrated into many pathways and interventions and other websites e.g. primary school, charities, churches. This is likely to create further work for the technical team in integrating the data but will demonstrate the value that data standards can provide.

Here are some use cases where accurate local service information is essential:

- **Waiting for a public sector service:** ASD assessment, social care financial
  assessment, surgery.
- **Complementary support to an intervention/pathway:** hospital discharge, benefit assessment, SEND.
- **Step down from an intervention/pathway:** mental Health, physiotherapy
- **Support after missing a threshold:** ASD/SEND, carer assessment, care review
- **Self-care to reduce dependency on the public sector:** support services for an elderly parent supported by their child or a smoker seeking support to quit.

## 4. Working with Taxonomies

Tagging datasets with taxonomy terms allows data to be searched and filtered for different purposes. ORUK allows most data entities to be tagged with taxonomy terms. The most common use is to tag services with service types, making it possible to extract services of types that meet specific needs.

Taxonomy terms allow data feed consumers to filter relevant data while ignoring the rest. For example, The Department for Education’s Family Hubs service finder can focus on data tagged with family-related service types.

Organisations will likely depend on software to filter data so a common UK taxonomy would create a market for software suppliers. The ORUK structure is flexible enough to incorporate any taxonomy terms, allowing adaptation as new information types emerge (e.g., new social media channels) without altering the data structure standard.

A national project with a government steering group is advancing taxonomy work to ensure it remains credible and sustainable, avoiding issues where investments are wasted on an obsolete or inconsistently applied taxonomy.

### 4.1 Recommended Taxonomies

The Local Government Association (LGA) offers three key taxonomies that comply with government standards and are W3C-compatible:

- [Community Services](http://id.esd.org.uk/list/communityServices)
- [Needs](http://id.esd.org.uk/list/needs)
- [Circumstances](https://standards.esd.org.uk/?uri=list%2FcircumstancesPersonal)

See the LGA’s taxonomy terms, especially for service types, to categorise services, needs (which are mapped to service types), and circumstances, which can also provide a route to identify appropriate service types.

Consistent use of taxonomies by different publishers will provide for reporting across regions and the UK as a whole. Local councils can apply their own internal terms for specific local purposes in addition to shared taxonomy terms.

## 5. Collaboration with suppliers

### 5.1 Approved Feeds

We’ve curated a [verified feed directory](/community/directory), available on the ORUK website, listing verified publishers and software developers.

### 5.2 Compliance

Software specifications and associated contractual requirements (made explicit in invitations to tender) should state that databases must be accompanied by an API that complies with the ORUK standard. This can be done on the [Check your ORUK compliance tool](/developers/validator) section of the ORUK website.

Maintaining a ‘pass’ result against continual testing, viewable on the [verified feed availability page](/developers/dashboard), should be a condition of software acceptance.

## 6. Technical Support

More detailed guidance and [developers section](/developers) relating to implementation can be found on the ORUK website.

The [Open Referral forum](https://forum.openreferral.org) is the go-to place for discussing technical and operational issues. Find out what others are saying, share insights, and ask questions.

Contact the team directly at hello@OpenReferralUK.org.
