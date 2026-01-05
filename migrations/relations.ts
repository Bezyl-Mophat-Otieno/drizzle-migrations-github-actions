import { relations } from "drizzle-orm/relations";
import { hsBusinesses, hsSocialMediaPosts, hsFeedbackResponses, ptlUsers, ptlRefreshTokens, ptlCompanies, ptlProducts, ptlBarcodes, ptlUpiPrefixes, ptlSubscriptions, ptlPlans, ptlCarryForwards, ptlCategories, ptlCompanyDirectors, ptlCompanySectors, ptlSectors, ptlInvoices, ptlInvoiceItems, ptlQrCodes, ptlSubscriptionUsages, ptlVerificationTokens, ptlCompanyDocuments, ptlPermissions, ptlRolesPermissions, ptlRoles, ptlUsersRoles, bqCategories, bqSubcategories, debitusers, expenses, budgets, incomes, hsRoles, hsRolesPermissions, hsPermissions, hsUsersRoles, hsUsers, hsVerificationTokens, hsUsersPermissions, hsLocations, hsDepartments, bqProducts, bqUsers, bqCart, bqOrders, bqOrderItems, bqProductFeedback, bqWishlist, ptlTransactions, hsCustomers, hsFeedbackRequests, hsFeedbackTemplates, plans, planPermissions, userPlans, subscriptions, hsQuestionAnswers, hsTemplateQuestions, hsSocialMediaConnections, hsSentimentAnalysis } from "./schema";

export const hsSocialMediaPostsRelations = relations(hsSocialMediaPosts, ({one}) => ({
	hsBusiness: one(hsBusinesses, {
		fields: [hsSocialMediaPosts.businessId],
		references: [hsBusinesses.businessId]
	}),
	hsFeedbackResponse: one(hsFeedbackResponses, {
		fields: [hsSocialMediaPosts.feedbackResponseId],
		references: [hsFeedbackResponses.feedbackResponseId]
	}),
}));

export const hsBusinessesRelations = relations(hsBusinesses, ({one, many}) => ({
	hsSocialMediaPosts: many(hsSocialMediaPosts),
	hsUser: one(hsUsers, {
		fields: [hsBusinesses.userId],
		references: [hsUsers.userId]
	}),
	hsLocations: many(hsLocations),
	hsCustomers: many(hsCustomers),
	hsFeedbackRequests: many(hsFeedbackRequests),
	hsSocialMediaConnections: many(hsSocialMediaConnections),
}));

export const hsFeedbackResponsesRelations = relations(hsFeedbackResponses, ({one, many}) => ({
	hsSocialMediaPosts: many(hsSocialMediaPosts),
	hsFeedbackRequest: one(hsFeedbackRequests, {
		fields: [hsFeedbackResponses.feedbackRequestId],
		references: [hsFeedbackRequests.feedbackRequestId]
	}),
	hsCustomer: one(hsCustomers, {
		fields: [hsFeedbackResponses.customerId],
		references: [hsCustomers.customerId]
	}),
	hsQuestionAnswers: many(hsQuestionAnswers),
	hsSentimentAnalyses: many(hsSentimentAnalysis),
}));

export const ptlRefreshTokensRelations = relations(ptlRefreshTokens, ({one}) => ({
	ptlUser: one(ptlUsers, {
		fields: [ptlRefreshTokens.userId],
		references: [ptlUsers.id]
	}),
}));

export const ptlUsersRelations = relations(ptlUsers, ({many}) => ({
	ptlRefreshTokens: many(ptlRefreshTokens),
	ptlCompanies: many(ptlCompanies),
	ptlVerificationTokens: many(ptlVerificationTokens),
	ptlUsersRoles: many(ptlUsersRoles),
	ptlTransactions: many(ptlTransactions),
}));

export const ptlProductsRelations = relations(ptlProducts, ({one, many}) => ({
	ptlCompany: one(ptlCompanies, {
		fields: [ptlProducts.companyId],
		references: [ptlCompanies.id]
	}),
	ptlBarcodes: many(ptlBarcodes),
	ptlQrCodes: many(ptlQrCodes),
}));

export const ptlCompaniesRelations = relations(ptlCompanies, ({one, many}) => ({
	ptlProducts: many(ptlProducts),
	ptlUpiPrefixes: many(ptlUpiPrefixes),
	ptlSubscriptions: many(ptlSubscriptions),
	ptlUser: one(ptlUsers, {
		fields: [ptlCompanies.userId],
		references: [ptlUsers.id]
	}),
	ptlCategory: one(ptlCategories, {
		fields: [ptlCompanies.categoryId],
		references: [ptlCategories.id]
	}),
	ptlCompanyDirectors: many(ptlCompanyDirectors),
	ptlCompanySectors: many(ptlCompanySectors),
	ptlCompanyDocuments: many(ptlCompanyDocuments),
	ptlTransactions: many(ptlTransactions),
}));

export const ptlBarcodesRelations = relations(ptlBarcodes, ({one}) => ({
	ptlProduct: one(ptlProducts, {
		fields: [ptlBarcodes.productId],
		references: [ptlProducts.id]
	}),
	ptlUpiPrefix: one(ptlUpiPrefixes, {
		fields: [ptlBarcodes.upiPrefixId],
		references: [ptlUpiPrefixes.id]
	}),
}));

export const ptlUpiPrefixesRelations = relations(ptlUpiPrefixes, ({one, many}) => ({
	ptlBarcodes: many(ptlBarcodes),
	ptlCompany: one(ptlCompanies, {
		fields: [ptlUpiPrefixes.companyId],
		references: [ptlCompanies.id]
	}),
}));

export const ptlSubscriptionsRelations = relations(ptlSubscriptions, ({one, many}) => ({
	ptlCompany: one(ptlCompanies, {
		fields: [ptlSubscriptions.companyId],
		references: [ptlCompanies.id]
	}),
	ptlPlan: one(ptlPlans, {
		fields: [ptlSubscriptions.planId],
		references: [ptlPlans.id]
	}),
	ptlCarryForwards: many(ptlCarryForwards),
	ptlInvoices: many(ptlInvoices),
	ptlSubscriptionUsages: many(ptlSubscriptionUsages),
}));

export const ptlPlansRelations = relations(ptlPlans, ({one, many}) => ({
	ptlSubscriptions: many(ptlSubscriptions),
	ptlCategory: one(ptlCategories, {
		fields: [ptlPlans.categoryId],
		references: [ptlCategories.id]
	}),
}));

export const ptlCarryForwardsRelations = relations(ptlCarryForwards, ({one}) => ({
	ptlSubscription: one(ptlSubscriptions, {
		fields: [ptlCarryForwards.subscriptionId],
		references: [ptlSubscriptions.id]
	}),
}));

export const ptlCategoriesRelations = relations(ptlCategories, ({many}) => ({
	ptlCompanies: many(ptlCompanies),
	ptlPlans: many(ptlPlans),
}));

export const ptlCompanyDirectorsRelations = relations(ptlCompanyDirectors, ({one}) => ({
	ptlCompany: one(ptlCompanies, {
		fields: [ptlCompanyDirectors.companyId],
		references: [ptlCompanies.id]
	}),
}));

export const ptlCompanySectorsRelations = relations(ptlCompanySectors, ({one}) => ({
	ptlCompany: one(ptlCompanies, {
		fields: [ptlCompanySectors.companyId],
		references: [ptlCompanies.id]
	}),
	ptlSector: one(ptlSectors, {
		fields: [ptlCompanySectors.sectorId],
		references: [ptlSectors.id]
	}),
}));

export const ptlSectorsRelations = relations(ptlSectors, ({many}) => ({
	ptlCompanySectors: many(ptlCompanySectors),
}));

export const ptlInvoicesRelations = relations(ptlInvoices, ({one, many}) => ({
	ptlSubscription: one(ptlSubscriptions, {
		fields: [ptlInvoices.subscriptionId],
		references: [ptlSubscriptions.id]
	}),
	ptlInvoiceItems: many(ptlInvoiceItems),
	ptlTransactions: many(ptlTransactions),
}));

export const ptlInvoiceItemsRelations = relations(ptlInvoiceItems, ({one}) => ({
	ptlInvoice: one(ptlInvoices, {
		fields: [ptlInvoiceItems.invoiceId],
		references: [ptlInvoices.id]
	}),
}));

export const ptlQrCodesRelations = relations(ptlQrCodes, ({one}) => ({
	ptlProduct: one(ptlProducts, {
		fields: [ptlQrCodes.productId],
		references: [ptlProducts.id]
	}),
}));

export const ptlSubscriptionUsagesRelations = relations(ptlSubscriptionUsages, ({one}) => ({
	ptlSubscription: one(ptlSubscriptions, {
		fields: [ptlSubscriptionUsages.subscriptionId],
		references: [ptlSubscriptions.id]
	}),
}));

export const ptlVerificationTokensRelations = relations(ptlVerificationTokens, ({one}) => ({
	ptlUser: one(ptlUsers, {
		fields: [ptlVerificationTokens.userId],
		references: [ptlUsers.id]
	}),
}));

export const ptlCompanyDocumentsRelations = relations(ptlCompanyDocuments, ({one}) => ({
	ptlCompany: one(ptlCompanies, {
		fields: [ptlCompanyDocuments.companyId],
		references: [ptlCompanies.id]
	}),
}));

export const ptlRolesPermissionsRelations = relations(ptlRolesPermissions, ({one}) => ({
	ptlPermission: one(ptlPermissions, {
		fields: [ptlRolesPermissions.permissionId],
		references: [ptlPermissions.id]
	}),
	ptlRole: one(ptlRoles, {
		fields: [ptlRolesPermissions.roleId],
		references: [ptlRoles.roleId]
	}),
}));

export const ptlPermissionsRelations = relations(ptlPermissions, ({many}) => ({
	ptlRolesPermissions: many(ptlRolesPermissions),
}));

export const ptlRolesRelations = relations(ptlRoles, ({many}) => ({
	ptlRolesPermissions: many(ptlRolesPermissions),
	ptlUsersRoles: many(ptlUsersRoles),
}));

export const ptlUsersRolesRelations = relations(ptlUsersRoles, ({one}) => ({
	ptlUser: one(ptlUsers, {
		fields: [ptlUsersRoles.userId],
		references: [ptlUsers.id]
	}),
	ptlRole: one(ptlRoles, {
		fields: [ptlUsersRoles.roleId],
		references: [ptlRoles.roleId]
	}),
}));

export const bqSubcategoriesRelations = relations(bqSubcategories, ({one, many}) => ({
	bqCategory: one(bqCategories, {
		fields: [bqSubcategories.categoryId],
		references: [bqCategories.categoryId]
	}),
	bqProducts: many(bqProducts),
}));

export const bqCategoriesRelations = relations(bqCategories, ({many}) => ({
	bqSubcategories: many(bqSubcategories),
	bqProducts: many(bqProducts),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	debituser: one(debitusers, {
		fields: [expenses.userId],
		references: [debitusers.userId]
	}),
	budget: one(budgets, {
		fields: [expenses.budgetId],
		references: [budgets.budgetId]
	}),
}));

export const debitusersRelations = relations(debitusers, ({many}) => ({
	expenses: many(expenses),
	incomes: many(incomes),
	budgets: many(budgets),
}));

export const budgetsRelations = relations(budgets, ({one, many}) => ({
	expenses: many(expenses),
	debituser: one(debitusers, {
		fields: [budgets.userId],
		references: [debitusers.userId]
	}),
}));

export const incomesRelations = relations(incomes, ({one}) => ({
	debituser: one(debitusers, {
		fields: [incomes.userId],
		references: [debitusers.userId]
	}),
}));

export const hsRolesPermissionsRelations = relations(hsRolesPermissions, ({one}) => ({
	hsRole: one(hsRoles, {
		fields: [hsRolesPermissions.roleId],
		references: [hsRoles.roleId]
	}),
	hsPermission: one(hsPermissions, {
		fields: [hsRolesPermissions.permissionId],
		references: [hsPermissions.permissionId]
	}),
}));

export const hsRolesRelations = relations(hsRoles, ({many}) => ({
	hsRolesPermissions: many(hsRolesPermissions),
	hsUsersRoles: many(hsUsersRoles),
}));

export const hsPermissionsRelations = relations(hsPermissions, ({many}) => ({
	hsRolesPermissions: many(hsRolesPermissions),
	hsUsersPermissions: many(hsUsersPermissions),
	planPermissions: many(planPermissions),
}));

export const hsUsersRolesRelations = relations(hsUsersRoles, ({one}) => ({
	hsRole: one(hsRoles, {
		fields: [hsUsersRoles.roleId],
		references: [hsRoles.roleId]
	}),
	hsUser: one(hsUsers, {
		fields: [hsUsersRoles.userId],
		references: [hsUsers.userId]
	}),
}));

export const hsUsersRelations = relations(hsUsers, ({many}) => ({
	hsUsersRoles: many(hsUsersRoles),
	hsVerificationTokens: many(hsVerificationTokens),
	hsUsersPermissions: many(hsUsersPermissions),
	hsBusinesses: many(hsBusinesses),
	hsFeedbackRequests: many(hsFeedbackRequests),
	userPlans: many(userPlans),
}));

export const hsVerificationTokensRelations = relations(hsVerificationTokens, ({one}) => ({
	hsUser: one(hsUsers, {
		fields: [hsVerificationTokens.userId],
		references: [hsUsers.userId]
	}),
}));

export const hsUsersPermissionsRelations = relations(hsUsersPermissions, ({one}) => ({
	hsUser: one(hsUsers, {
		fields: [hsUsersPermissions.userId],
		references: [hsUsers.userId]
	}),
	hsPermission: one(hsPermissions, {
		fields: [hsUsersPermissions.permissionId],
		references: [hsPermissions.permissionId]
	}),
}));

export const hsLocationsRelations = relations(hsLocations, ({one, many}) => ({
	hsBusiness: one(hsBusinesses, {
		fields: [hsLocations.businessId],
		references: [hsBusinesses.businessId]
	}),
	hsDepartments: many(hsDepartments),
	hsFeedbackRequests: many(hsFeedbackRequests),
}));

export const hsDepartmentsRelations = relations(hsDepartments, ({one, many}) => ({
	hsLocation: one(hsLocations, {
		fields: [hsDepartments.locationId],
		references: [hsLocations.locationId]
	}),
	hsFeedbackRequests: many(hsFeedbackRequests),
}));

export const bqProductsRelations = relations(bqProducts, ({one, many}) => ({
	bqSubcategory: one(bqSubcategories, {
		fields: [bqProducts.subCategoryId],
		references: [bqSubcategories.subCategoryId]
	}),
	bqCategory: one(bqCategories, {
		fields: [bqProducts.categoryId],
		references: [bqCategories.categoryId]
	}),
	bqCarts: many(bqCart),
	bqOrderItems: many(bqOrderItems),
	bqProductFeedbacks: many(bqProductFeedback),
	bqWishlists: many(bqWishlist),
}));

export const bqCartRelations = relations(bqCart, ({one}) => ({
	bqUser: one(bqUsers, {
		fields: [bqCart.userId],
		references: [bqUsers.userId]
	}),
	bqProduct: one(bqProducts, {
		fields: [bqCart.productId],
		references: [bqProducts.productId]
	}),
}));

export const bqUsersRelations = relations(bqUsers, ({many}) => ({
	bqCarts: many(bqCart),
	bqOrders: many(bqOrders),
	bqWishlists: many(bqWishlist),
}));

export const bqOrdersRelations = relations(bqOrders, ({one, many}) => ({
	bqUser: one(bqUsers, {
		fields: [bqOrders.userId],
		references: [bqUsers.userId]
	}),
	bqOrderItems: many(bqOrderItems),
}));

export const bqOrderItemsRelations = relations(bqOrderItems, ({one}) => ({
	bqOrder: one(bqOrders, {
		fields: [bqOrderItems.orderId],
		references: [bqOrders.orderId]
	}),
	bqProduct: one(bqProducts, {
		fields: [bqOrderItems.productId],
		references: [bqProducts.productId]
	}),
}));

export const bqProductFeedbackRelations = relations(bqProductFeedback, ({one}) => ({
	bqProduct: one(bqProducts, {
		fields: [bqProductFeedback.productId],
		references: [bqProducts.productId]
	}),
}));

export const bqWishlistRelations = relations(bqWishlist, ({one}) => ({
	bqUser: one(bqUsers, {
		fields: [bqWishlist.userId],
		references: [bqUsers.userId]
	}),
	bqProduct: one(bqProducts, {
		fields: [bqWishlist.productId],
		references: [bqProducts.productId]
	}),
}));

export const ptlTransactionsRelations = relations(ptlTransactions, ({one}) => ({
	ptlCompany: one(ptlCompanies, {
		fields: [ptlTransactions.companyId],
		references: [ptlCompanies.id]
	}),
	ptlUser: one(ptlUsers, {
		fields: [ptlTransactions.userId],
		references: [ptlUsers.id]
	}),
	ptlInvoice: one(ptlInvoices, {
		fields: [ptlTransactions.invoiceId],
		references: [ptlInvoices.id]
	}),
}));

export const hsCustomersRelations = relations(hsCustomers, ({one, many}) => ({
	hsBusiness: one(hsBusinesses, {
		fields: [hsCustomers.businessId],
		references: [hsBusinesses.businessId]
	}),
	hsFeedbackResponses: many(hsFeedbackResponses),
	hsQuestionAnswers: many(hsQuestionAnswers),
}));

export const hsFeedbackRequestsRelations = relations(hsFeedbackRequests, ({one, many}) => ({
	hsBusiness: one(hsBusinesses, {
		fields: [hsFeedbackRequests.businessIdd],
		references: [hsBusinesses.businessId]
	}),
	hsLocation: one(hsLocations, {
		fields: [hsFeedbackRequests.locationId],
		references: [hsLocations.locationId]
	}),
	hsDepartment: one(hsDepartments, {
		fields: [hsFeedbackRequests.departmentId],
		references: [hsDepartments.departmentId]
	}),
	hsFeedbackTemplate: one(hsFeedbackTemplates, {
		fields: [hsFeedbackRequests.templateId],
		references: [hsFeedbackTemplates.templateId]
	}),
	hsUser: one(hsUsers, {
		fields: [hsFeedbackRequests.requesterId],
		references: [hsUsers.userId]
	}),
	hsFeedbackResponses: many(hsFeedbackResponses),
}));

export const hsFeedbackTemplatesRelations = relations(hsFeedbackTemplates, ({many}) => ({
	hsFeedbackRequests: many(hsFeedbackRequests),
	hsTemplateQuestions: many(hsTemplateQuestions),
}));

export const planPermissionsRelations = relations(planPermissions, ({one}) => ({
	plan: one(plans, {
		fields: [planPermissions.planId],
		references: [plans.planId]
	}),
	hsPermission: one(hsPermissions, {
		fields: [planPermissions.permissionId],
		references: [hsPermissions.permissionId]
	}),
}));

export const plansRelations = relations(plans, ({many}) => ({
	planPermissions: many(planPermissions),
	userPlans: many(userPlans),
}));

export const userPlansRelations = relations(userPlans, ({one, many}) => ({
	hsUser: one(hsUsers, {
		fields: [userPlans.userId],
		references: [hsUsers.userId]
	}),
	plan: one(plans, {
		fields: [userPlans.planId],
		references: [plans.planId]
	}),
	subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	userPlan: one(userPlans, {
		fields: [subscriptions.userPlanId],
		references: [userPlans.id]
	}),
}));

export const hsQuestionAnswersRelations = relations(hsQuestionAnswers, ({one, many}) => ({
	hsCustomer: one(hsCustomers, {
		fields: [hsQuestionAnswers.customerId],
		references: [hsCustomers.customerId]
	}),
	hsTemplateQuestion: one(hsTemplateQuestions, {
		fields: [hsQuestionAnswers.templateQuestionId],
		references: [hsTemplateQuestions.templateQuestionId]
	}),
	hsFeedbackResponse: one(hsFeedbackResponses, {
		fields: [hsQuestionAnswers.feedbackResponseId],
		references: [hsFeedbackResponses.feedbackResponseId]
	}),
	hsSentimentAnalyses: many(hsSentimentAnalysis),
}));

export const hsTemplateQuestionsRelations = relations(hsTemplateQuestions, ({one, many}) => ({
	hsQuestionAnswers: many(hsQuestionAnswers),
	hsFeedbackTemplate: one(hsFeedbackTemplates, {
		fields: [hsTemplateQuestions.templateId],
		references: [hsFeedbackTemplates.templateId]
	}),
}));

export const hsSocialMediaConnectionsRelations = relations(hsSocialMediaConnections, ({one}) => ({
	hsBusiness: one(hsBusinesses, {
		fields: [hsSocialMediaConnections.businessId],
		references: [hsBusinesses.businessId]
	}),
}));

export const hsSentimentAnalysisRelations = relations(hsSentimentAnalysis, ({one}) => ({
	hsFeedbackResponse: one(hsFeedbackResponses, {
		fields: [hsSentimentAnalysis.feedbackResponseId],
		references: [hsFeedbackResponses.feedbackResponseId]
	}),
	hsQuestionAnswer: one(hsQuestionAnswers, {
		fields: [hsSentimentAnalysis.questionAnswerId],
		references: [hsQuestionAnswers.questionAnswerId]
	}),
}));