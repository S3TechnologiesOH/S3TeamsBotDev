'use strict';
exports.__esModule = true;
var api_1 = require("./api/api");
var Connectwise = (function () {
    function Connectwise(host, companyId, publicKey, privateKey) {
        this.authKey = new Buffer(companyId + "+" + publicKey + ":" + privateKey).toString('base64');
        this.AccountingBatchesApi = new api_1.AccountingBatchesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AccountingUnpostedExpensesApi = new api_1.AccountingUnpostedExpensesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AccountingUnpostedProcurementsApi = new api_1.AccountingUnpostedProcurementsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AccountingUnpostedinvoicesApi = new api_1.AccountingUnpostedinvoicesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ActivitiesApi = new api_1.ActivitiesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ActivityStatusesApi = new api_1.ActivityStatusesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ActivityStopwatchesApi = new api_1.ActivityStopwatchesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ActivityTypesApi = new api_1.ActivityTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AdjustmentDetailsApi = new api_1.AdjustmentDetailsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AdjustmentTypesApi = new api_1.AdjustmentTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AdjustmentsApi = new api_1.AdjustmentsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AgreementSitesApi = new api_1.AgreementSitesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AgreementAdditionsApi = new api_1.AgreementAdditionsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AgreementAdjustmentsApi = new api_1.AgreementAdjustmentsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AgreementBoardDefaultsApi = new api_1.AgreementBoardDefaultsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AgreementTypesApi = new api_1.AgreementTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AgreementWorkRoleExclusionsApi = new api_1.AgreementWorkRoleExclusionsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AgreementWorkRolesApi = new api_1.AgreementWorkRolesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AgreementWorkTypeExclusionsApi = new api_1.AgreementWorkTypeExclusionsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AgreementWorkTypesApi = new api_1.AgreementWorkTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AgreementsApi = new api_1.AgreementsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AuditTrailApi = new api_1.AuditTrailApi("https://" + host + "/v4_6_release/apis/3.0");
        this.BatchApi = new api_1.BatchApi("https://" + host + "/v4_6_release/apis/3.0");
        this.BoardExcludedMembersApi = new api_1.BoardExcludedMembersApi("https://" + host + "/v4_6_release/apis/3.0");
        this.BoardItemsApi = new api_1.BoardItemsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.BoardStatusesApi = new api_1.BoardStatusesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.BoardSubTypesApi = new api_1.BoardSubTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.BoardTeamsApi = new api_1.BoardTeamsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.BoardTypesApi = new api_1.BoardTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.BoardSubtypeAssociationsApi = new api_1.BoardSubtypeAssociationsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.BoardsApi = new api_1.BoardsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CallbacksApi = new api_1.CallbacksApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CampaignAuditsApi = new api_1.CampaignAuditsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CampaignEmailsOpenedApi = new api_1.CampaignEmailsOpenedApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CampaignFormsSubmittedApi = new api_1.CampaignFormsSubmittedApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CampaignLinksClickedApi = new api_1.CampaignLinksClickedApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CampaignStatusesApi = new api_1.CampaignStatusesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CampaignSubTypesApi = new api_1.CampaignSubTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CampaignTypesApi = new api_1.CampaignTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CampaignsApi = new api_1.CampaignsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CatalogComponentsApi = new api_1.CatalogComponentsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CatalogsItemApi = new api_1.CatalogsItemApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CategoriesApi = new api_1.CategoriesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CertificationsApi = new api_1.CertificationsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CodesApi = new api_1.CodesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CompaniesApi = new api_1.CompaniesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CompanyCustomNotesApi = new api_1.CompanyCustomNotesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CompanyManagementSummaryReportsApi = new api_1.CompanyManagementSummaryReportsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CompanyNotesApi = new api_1.CompanyNotesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CompanyNoteTypesApi = new api_1.CompanyNoteTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CompanySitesApi = new api_1.CompanySitesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CompanyStatusesApi = new api_1.CompanyStatusesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CompanyTeamsApi = new api_1.CompanyTeamsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CompanyTypesApi = new api_1.CompanyTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ConfigurationStatusesApi = new api_1.ConfigurationStatusesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ConfigurationTypeQuestionsApi = new api_1.ConfigurationTypeQuestionsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ConfigurationTypesApi = new api_1.ConfigurationTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ContactsApi = new api_1.ContactsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.CurrenciesApi = new api_1.CurrenciesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ConfigurationsApi = new api_1.ConfigurationsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ContactNotesApi = new api_1.ContactNotesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ContactTypesApi = new api_1.ContactTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ContactTracksApi = new api_1.ContactTracksApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ContactDepartmentsApi = new api_1.ContactDepartmentsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ContactRelationshipsApi = new api_1.ContactRelationshipsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ContactCommunicationsApi = new api_1.ContactCommunicationsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ConnectWiseHostedSetupsApi = new api_1.ConnectWiseHostedSetupsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.DocumentsApi = new api_1.DocumentsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ExpenseEntriesApi = new api_1.ExpenseEntriesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ExpenseTypesApi = new api_1.ExpenseTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.GroupCompaniesApi = new api_1.GroupCompaniesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.GroupsApi = new api_1.GroupsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.GroupContactsApi = new api_1.GroupContactsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.InfoApi = new api_1.InfoApi("https://" + host + "/v4_6_release/apis/3.0");
        this.InOutBoardsApi = new api_1.InOutBoardsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.InOutTypesApi = new api_1.InOutTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.InvoicesApi = new api_1.InvoicesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.InvoicePaymentsApi = new api_1.InvoicePaymentsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.KnowledgeBaseArticlesApi = new api_1.KnowledgeBaseArticlesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.LinksApi = new api_1.LinksApi("https://" + host + "/v4_6_release/apis/3.0");
        this.LocationsApi = new api_1.LocationsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.MembersApi = new api_1.MembersApi("https://" + host + "/v4_6_release/apis/3.0");
        this.MemberTypesApi = new api_1.MemberTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ManufacturersApi = new api_1.ManufacturersApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ManagementBackupsApi = new api_1.ManagementBackupsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ManagementEmailsApi = new api_1.ManagementEmailsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.MarketDescriptionsApi = new api_1.MarketDescriptionsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.MenuEntriesApi = new api_1.MenuEntriesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OpportunitiesApi = new api_1.OpportunitiesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OrdersApi = new api_1.OrdersApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OrderStatusesApi = new api_1.OrderStatusesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OpportunityNotesApi = new api_1.OpportunityNotesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OpportunityTeamsApi = new api_1.OpportunityTeamsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OpportunityTypesApi = new api_1.OpportunityTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OpportunityRatingsApi = new api_1.OpportunityRatingsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OpportunityContactsApi = new api_1.OpportunityContactsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OpportunityStatusesApi = new api_1.OpportunityStatusesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OpportunityStagesApi = new api_1.OpportunityStagesApi("https://" + host + "/v4_6_release/3.0");
        this.OpportunityForecastsApi = new api_1.OpportunityForecastsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.OwnershipTypesApi = new api_1.OwnershipTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.PricingBreaksApi = new api_1.PricingBreaksApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ProjectsApi = new api_1.ProjectsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.PrioritiesApi = new api_1.PrioritiesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ProductsItemApi = new api_1.ProductsItemApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ProductTypesApi = new api_1.ProductTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ProjectNotesApi = new api_1.ProjectNotesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ProjectPhasesApi = new api_1.ProjectPhasesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.PricingDetailsApi = new api_1.PricingDetailsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.PurchaseOrdersApi = new api_1.PurchaseOrdersApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ProjectContactsApi = new api_1.ProjectContactsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.PricingSchedulesApi = new api_1.PricingSchedulesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ProductComponentsApi = new api_1.ProductComponentsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ProjectsTeammembersApi = new api_1.ProjectsTeammembersApi("https://" + host + "/v4_6_release/apis/3.0");
        this.PurchaseOrderLineItemsApi = new api_1.PurchaseOrderLineItemsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ProductPickingShippingDetailsApi = new api_1.ProductPickingShippingDetailsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ReportsApi = new api_1.ReportsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.RMAActionsApi = new api_1.RMAActionsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.RMADispositionsApi = new api_1.RMADispositionsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.RolesApi = new api_1.RolesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.SalesProbabilitiesApi = new api_1.SalesProbabilitiesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.SourcesApi = new api_1.SourcesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.SurveysApi = new api_1.SurveysApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ScheduleTypesApi = new api_1.ScheduleTypesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.SubCategoriesApi = new api_1.SubCategoriesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.SurveyResultsApi = new api_1.SurveyResultsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ScheduleEntriesApi = new api_1.ScheduleEntriesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ShipmentMethodsApi = new api_1.ShipmentMethodsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.SurveyQuestionsApi = new api_1.SurveyQuestionsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ScheduleStatusesApi = new api_1.ScheduleStatusesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ScheduleStopwatchesApi = new api_1.ScheduleStopwatchesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.ScheduleReminderTimesApi = new api_1.ScheduleReminderTimesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.TaxCodeXRefsApi = new api_1.TaxCodeXRefsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.TeamRolesApi = new api_1.TeamRolesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.SkillsApi = new api_1.SkillsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.SkillCategoriesApi = new api_1.SkillCategoriesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.TodayPageCategoriesApi = new api_1.TodayPageCategoriesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.TicketsApi = new api_1.TicketsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.TaxCodesApi = new api_1.TaxCodesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.TicketNotesApi = new api_1.TicketNotesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.TicketTasksApi = new api_1.TicketTasksApi("https://" + host + "/v4_6_release/apis/3.0");
        this.TimeEntriesApi = new api_1.TimeEntriesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.TicketStopwatchesApi = new api_1.TicketStopwatchesApi("https://" + host + "/v4_6_release/apis/3.0");
        this.UnitOfMeasureConversionsApi = new api_1.UnitOfMeasureConversionsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.UnitOfMeasuresApi = new api_1.UnitOfMeasuresApi("https://" + host + "/v4_6_release/apis/3.0");
        this.UserDefinedFieldsApi = new api_1.UserDefinedFieldsApi("https://" + host + "/v4_6_release/apis/3.0");
        this.AccountingBatchesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AccountingUnpostedExpensesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AccountingUnpostedProcurementsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AccountingUnpostedinvoicesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ActivitiesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ActivityStatusesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ActivityStopwatchesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ActivityTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AdjustmentDetailsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AdjustmentTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AdjustmentsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AgreementSitesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AgreementAdditionsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AgreementAdjustmentsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AgreementBoardDefaultsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AgreementTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AgreementWorkRoleExclusionsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AgreementWorkRolesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AgreementWorkTypeExclusionsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AgreementWorkTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AgreementsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.AuditTrailApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.BatchApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.BoardExcludedMembersApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.BoardItemsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.BoardStatusesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.BoardSubTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.BoardTeamsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.BoardTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.BoardsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CallbacksApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CampaignAuditsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CampaignEmailsOpenedApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CampaignFormsSubmittedApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CampaignLinksClickedApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CampaignStatusesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CampaignSubTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CampaignTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CampaignsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CatalogComponentsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CatalogsItemApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CategoriesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CodesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CompaniesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CompanyCustomNotesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CompanyManagementSummaryReportsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CompanyNotesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CompanySitesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CompanyStatusesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CompanyTeamsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CompanyTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ConfigurationStatusesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ConfigurationTypeQuestionsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ConfigurationTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ContactsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CurrenciesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ConfigurationsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ContactNotesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ContactTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ContactTracksApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ContactDepartmentsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ContactRelationshipsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ContactCommunicationsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ConnectWiseHostedSetupsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.DocumentsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ExpenseEntriesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ExpenseTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.GroupCompaniesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.GroupsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.GroupContactsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.InfoApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.InvoicesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.InvoicePaymentsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.KnowledgeBaseArticlesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.LinksApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.LocationsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.MembersApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ManufacturersApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.MenuEntriesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OpportunitiesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OrdersApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OrderStatusesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OpportunityNotesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OpportunityTeamsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OpportunityTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OpportunityRatingsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OpportunityContactsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OpportunityStatusesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OpportunityForecastsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.PricingBreaksApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ProjectsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.PrioritiesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ProductsItemApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ProductTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ProjectNotesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ProjectPhasesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.PricingDetailsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.PurchaseOrdersApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ProjectContactsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.PricingSchedulesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ProductComponentsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ProjectsTeammembersApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.PurchaseOrderLineItemsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ProductPickingShippingDetailsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ReportsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.SourcesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.SurveysApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ScheduleTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.SubCategoriesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.SurveyResultsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ScheduleEntriesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ShipmentMethodsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.SurveyQuestionsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ScheduleStatusesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ScheduleStopwatchesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ScheduleReminderTimesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.TaxCodeXRefsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.TicketsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.TaxCodesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.TicketNotesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.TicketTasksApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.TimeEntriesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.TicketStopwatchesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.UnitOfMeasureConversionsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.UnitOfMeasuresApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.UserDefinedFieldsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.BoardSubtypeAssociationsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CertificationsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.CompanyNoteTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.InOutBoardsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.InOutTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ManagementBackupsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.ManagementEmailsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.MarketDescriptionsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.MemberTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OpportunityStagesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.OwnershipTypesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.RMAActionsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.RMADispositionsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.RolesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.SalesProbabilitiesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.TeamRolesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.SkillsApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.SkillCategoriesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
        this.TodayPageCategoriesApi.defaultHeaders = {
            'Authorization': "Basic " + this.authKey
        };
    }
    return Connectwise;
}());
exports.Connectwise = Connectwise;
