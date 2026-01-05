import { pgTable, foreignKey, uuid, text, varchar, timestamp, jsonb, unique, uniqueIndex, numeric, boolean, integer, date, serial, index, bigint, check, pgMaterializedView, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const analysisStatus = pgEnum("analysis_status", ['pending', 'processing', 'completed', 'failed'])
export const billingCycle = pgEnum("billing_cycle", ['monthly', 'semi_annually', 'annually'])
export const companyDocumentStatus = pgEnum("company_document_status", ['accepted', 'declined', 'pending'])
export const companyStatus = pgEnum("company_status", ['active', 'inactive'])
export const feedbackReqStatus = pgEnum("feedback_req_status", ['pending', 'sent', 'failed', 'opened', 'generated'])
export const hsBillingCycle = pgEnum("hs_billing_cycle", ['monthly', 'semi_annually', 'annually'])
export const hsCustomerStatus = pgEnum("hs_customer_status", ['active', 'inactive'])
export const hsFeedbackChannel = pgEnum("hs_feedback_channel", ['email', 'sms', 'whatsapp', 'qr'])
export const hsInputTypes = pgEnum("hs_input_types", ['input', 'textarea', 'radio', 'checkbox'])
export const hsSocialPlatform = pgEnum("hs_social_platform", ['google_business', 'facebook', 'yelp', 'tripadvisor'])
export const hsStatus = pgEnum("hs_status", ['active', 'inactive', 'pending'])
export const hsSubscriptionStatus = pgEnum("hs_subscription_status", ['active', 'pending', 'canceled'])
export const messageService = pgEnum("message_service", ['AUTH_EMAIL_VERIFICATION', 'AUTH_PASSWORD_RESET', 'AUTH_REGISTRATION_CONFIRMATION', 'FEEDBACK_REQUEST', 'FEEDBACK_REMINDER', 'CONTACT_US', 'WAITLIST_CONFIRMATION', 'BUSINESS_NOTIFICATION', 'SYSTEM_ALERT', 'MARKETING_CAMPAIGN', 'GENERAL_EMAIL', 'SMS_NOTIFICATION', 'SMS_MARKETING', 'SMS_ALERT', 'CONTACT_US_ACKNOWLEDGEMENT'])
export const messageStatus = pgEnum("message_status", ['pending', 'sent', 'delivered', 'failed', 'bounced'])
export const orderStatusEnum = pgEnum("order_status_enum", ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
export const paymentStatusEnum = pgEnum("payment_status_enum", ['pending', 'paid', 'failed'])
export const postStatus = pgEnum("post_status", ['pending', 'posted', 'failed', 'rejected'])
export const productStatus = pgEnum("product_status", ['in-production', 'out-production'])
export const productStatusEnum = pgEnum("product_status_enum", ['available', 'out_of_stock', 'unavailable'])
export const ptlBillingCycle = pgEnum("ptl_billing_cycle", ['monthly', 'semi_annually', 'annually'])
export const ptlSubscriptionStatus = pgEnum("ptl_subscription_status", ['active', 'pending', 'canceled'])
export const roleEnum = pgEnum("role_enum", ['customer', 'admin', 'superadmin'])
export const sentiment = pgEnum("sentiment", ['positive', 'negative', 'neutral'])
export const status = pgEnum("status", ['active', 'inactive', 'pending'])
export const statusEnum = pgEnum("status_enum", ['active', 'pending', 'suspended'])
export const upiType = pgEnum("upi_type", ['UPI7', 'UPI11', 'UPI13'])
export const userRole = pgEnum("user_role", ['admin', 'user', 'guest'])
export const userStatus = pgEnum("user_status", ['pending', 'active', 'suspended'])
export const verificationTokenType = pgEnum("verification_token_type", ['email', 'reset'])


export const hsSocialMediaPosts = pgTable("hs_social_media_posts", {
	postId: uuid("PostId").defaultRandom().primaryKey().notNull(),
	businessId: uuid("BusinessId").notNull(),
	feedbackResponseId: uuid("FeedbackResponseId").notNull(),
	platform: hsSocialPlatform("Platform").notNull(),
	status: postStatus("Status").default('pending').notNull(),
	postContent: text("PostContent").notNull(),
	platformPostId: varchar("PlatformPostId", { length: 255 }),
	errorMessage: text("ErrorMessage"),
	retryCount: text("RetryCount").default('0').notNull(),
	postedAt: timestamp("PostedAt", { mode: 'string' }),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }).defaultNow().notNull(),
	successMessage: text("SuccessMessage"),
}, (table) => [
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [hsBusinesses.businessId],
			name: "hs_social_media_posts_BusinessId_hs_businesses_BusinessId_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.feedbackResponseId],
			foreignColumns: [hsFeedbackResponses.feedbackResponseId],
			name: "hs_social_media_posts_FeedbackResponseId_hs_feedback_responses_"
		}).onDelete("cascade"),
]);

export const hsMessagePersistence = pgTable("hs_message_persistence", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	service: messageService().notNull(),
	channel: hsFeedbackChannel().notNull(),
	to: text().notNull(),
	toName: text("to_name"),
	from: text().notNull(),
	fromName: text("from_name"),
	subject: text(),
	templateId: text("template_id"),
	params: jsonb(),
	messageId: text("message_id"),
	status: messageStatus().default('pending').notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	openedAt: timestamp("opened_at", { mode: 'string' }),
	failedAt: timestamp("failed_at", { mode: 'string' }),
	errorMessage: text("error_message"),
	retryCount: text("retry_count").default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const ptlSettings = pgTable("ptl_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	key: text().notNull(),
	value: text().notNull(),
	description: text(),
	category: text().default('general'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("ptl_settings_key_unique").on(table.key),
]);

export const ptlUsers = pgTable("ptl_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	username: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	countryCode: varchar("country_code", { length: 5 }).default('+254'),
	phoneNumber: varchar("phone_number", { length: 20 }),
	avatar: varchar({ length: 500 }),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	status: userStatus().default('pending').notNull(),
	emailVerifiedAt: timestamp("email_verified_at", { mode: 'string' }),
	companyId: uuid("company_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("ptl_unique_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("ptl_unique_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("ptl_users_username_unique").on(table.username),
	unique("ptl_users_email_unique").on(table.email),
]);

export const ptlRefreshTokens = pgTable("ptl_refresh_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	userAgent: text("user_agent"),
	ip: varchar({ length: 100 }),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [ptlUsers.id],
			name: "ptl_refresh_tokens_user_id_ptl_users_id_fk"
		}).onDelete("cascade"),
	unique("ptl_refresh_tokens_token_unique").on(table.token),
]);

export const ptlProducts = pgTable("ptl_products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	barcodeId: uuid("barcode_id"),
	qrCodeId: uuid("qr_code_id"),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	unitOfMeasurement: varchar("unit_of_measurement", { length: 50 }).notNull(),
	netWeight: numeric("net_weight", { precision: 10, scale:  3 }).notNull(),
	countryOfIssue: varchar("country_of_issue", { length: 100 }).notNull(),
	size: varchar({ length: 100 }),
	color: varchar({ length: 50 }),
	imageUrl: text("image_url"),
	status: productStatus().default('in-production').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [ptlCompanies.id],
			name: "ptl_products_company_id_ptl_companies_id_fk"
		}).onDelete("cascade"),
]);

export const ptlBarcodes = pgTable("ptl_barcodes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	upiPrefixId: uuid("upi_prefix_id").notNull(),
	sequenceNumber: varchar("sequence_number", { length: 10 }).notNull(),
	barcodeNumber: varchar("barcode_number", { length: 15 }).notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [ptlProducts.id],
			name: "ptl_barcodes_product_id_ptl_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.upiPrefixId],
			foreignColumns: [ptlUpiPrefixes.id],
			name: "ptl_barcodes_upi_prefix_id_ptl_upi_prefixes_id_fk"
		}).onDelete("cascade"),
	unique("ptl_barcodes_barcode_number_unique").on(table.barcodeNumber),
]);

export const ptlUpiPrefixes = pgTable("ptl_upi_prefixes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	prefix: varchar({ length: 12 }).notNull(),
	type: upiType().notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	maxProducts: integer("max_products").notNull(),
	usedCount: integer("used_count").default(0).notNull(),
	nextSequenceNumber: integer("next_sequence_number").default(1).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_active_upi_per_company").using("btree", table.companyId.asc().nullsLast().op("uuid_ops")).where(sql`(is_active = true)`),
	uniqueIndex("unique_upi_prefix").using("btree", table.prefix.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [ptlCompanies.id],
			name: "ptl_upi_prefixes_company_id_ptl_companies_id_fk"
		}).onDelete("cascade"),
]);

export const ptlSubscriptions = pgTable("ptl_subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	planId: uuid("plan_id").notNull(),
	status: ptlSubscriptionStatus().default('pending').notNull(),
	startDate: date("start_date"),
	endDate: date("end_date"),
	currentPeriodStart: date("current_period_start"),
	currentPeriodEnd: date("current_period_end"),
	nextBillingDate: date("next_billing_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [ptlCompanies.id],
			name: "ptl_subscriptions_company_id_ptl_companies_id_fk"
		}),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [ptlPlans.id],
			name: "ptl_subscriptions_plan_id_ptl_plans_id_fk"
		}),
]);

export const ptlCarryForwards = pgTable("ptl_carry_forwards", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	subscriptionId: uuid("subscription_id").notNull(),
	fromCycleStart: date("from_cycle_start").notNull(),
	fromCycleEnd: date("from_cycle_end").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	appliedToCycleStart: date("applied_to_cycle_start"),
	appliedToCycleEnd: date("applied_to_cycle_end"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.subscriptionId],
			foreignColumns: [ptlSubscriptions.id],
			name: "ptl_carry_forwards_subscription_id_ptl_subscriptions_id_fk"
		}),
]);

export const ptlCompanies = pgTable("ptl_companies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	categoryId: uuid("category_id"),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	physicalAddress: text("physical_address").notNull(),
	country: varchar({ length: 100 }).notNull(),
	websiteUrl: varchar("website_url", { length: 255 }),
	logoUrl: varchar("logo_url", { length: 500 }),
	status: companyStatus().default('inactive').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [ptlUsers.id],
			name: "ptl_companies_user_id_ptl_users_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [ptlCategories.id],
			name: "ptl_companies_category_id_ptl_categories_id_fk"
		}),
]);

export const ptlCategories = pgTable("ptl_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const ptlCompanyDirectors = pgTable("ptl_company_directors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 30 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [ptlCompanies.id],
			name: "ptl_company_directors_company_id_ptl_companies_id_fk"
		}),
]);

export const ptlCompanySectors = pgTable("ptl_company_sectors", {
	companyId: uuid("company_id").notNull(),
	sectorId: uuid("sector_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_company_sector").using("btree", table.companyId.asc().nullsLast().op("uuid_ops"), table.sectorId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [ptlCompanies.id],
			name: "ptl_company_sectors_company_id_ptl_companies_id_fk"
		}),
	foreignKey({
			columns: [table.sectorId],
			foreignColumns: [ptlSectors.id],
			name: "ptl_company_sectors_sector_id_ptl_sectors_id_fk"
		}),
]);

export const ptlSectors = pgTable("ptl_sectors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const ptlInvoices = pgTable("ptl_invoices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	subscriptionId: uuid("subscription_id").notNull(),
	invoiceDate: timestamp("invoice_date", { mode: 'string' }).defaultNow().notNull(),
	dueDate: date("due_date"),
	status: varchar({ length: 20 }).default('pending'),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.subscriptionId],
			foreignColumns: [ptlSubscriptions.id],
			name: "ptl_invoices_subscription_id_ptl_subscriptions_id_fk"
		}),
]);

export const ptlInvoiceItems = pgTable("ptl_invoice_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	description: varchar({ length: 255 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [ptlInvoices.id],
			name: "ptl_invoice_items_invoice_id_ptl_invoices_id_fk"
		}),
]);

export const ptlPlans = pgTable("ptl_plans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	categoryId: uuid("category_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	maintenanceFee: integer("maintenance_fee").notNull(),
	barcodeFee: integer("barcode_fee").notNull(),
	billingCycle: ptlBillingCycle().default('annually').notNull(),
	usageLimit: integer("usage_limit").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [ptlCategories.id],
			name: "ptl_plans_category_id_ptl_categories_id_fk"
		}),
]);

export const ptlQrCodes = pgTable("ptl_qr_codes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	qrCodeImageUrl: text("qr_code_image_url").notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [ptlProducts.id],
			name: "ptl_qr_codes_product_id_ptl_products_id_fk"
		}).onDelete("cascade"),
]);

export const ptlPermissions = pgTable("ptl_permissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	module: varchar({ length: 50 }).notNull(),
	submodule: varchar({ length: 50 }),
	action: varchar({ length: 50 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_permission").using("btree", table.module.asc().nullsLast().op("text_ops"), table.submodule.asc().nullsLast().op("text_ops"), table.action.asc().nullsLast().op("text_ops")),
]);

export const ptlSubscriptionUsages = pgTable("ptl_subscription_usages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	subscriptionId: uuid("subscription_id").notNull(),
	cycleStart: date("cycle_start").notNull(),
	cycleEnd: date("cycle_end").notNull(),
	generatedCodes: integer("generated_codes").default(0).notNull(),
	extraCharges: numeric("extra_charges", { precision: 10, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.subscriptionId],
			foreignColumns: [ptlSubscriptions.id],
			name: "ptl_subscription_usages_subscription_id_ptl_subscriptions_id_fk"
		}),
]);

export const ptlVerificationTokens = pgTable("ptl_verification_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	type: verificationTokenType().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [ptlUsers.id],
			name: "ptl_verification_tokens_user_id_ptl_users_id_fk"
		}).onDelete("cascade"),
	unique("ptl_verification_tokens_token_unique").on(table.token),
]);

export const ptlCompanyDocuments = pgTable("ptl_company_documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	fileUrl: varchar("file_url", { length: 1000 }).notNull(),
	status: companyDocumentStatus().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	rejectionReason: text("RejectionReason"),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [ptlCompanies.id],
			name: "ptl_company_documents_company_id_ptl_companies_id_fk"
		}),
]);

export const ptlRolesPermissions = pgTable("ptl_roles_permissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	permissionId: uuid("permission_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	roleId: integer("role_id").notNull(),
}, (table) => [
	uniqueIndex("unique_role_permission").using("btree", table.roleId.asc().nullsLast().op("int4_ops"), table.permissionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [ptlPermissions.id],
			name: "ptl_roles_permissions_permission_id_ptl_permissions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [ptlRoles.roleId],
			name: "ptl_roles_permissions_role_id_ptl_roles_role_id_fk"
		}).onDelete("cascade"),
]);

export const ptlRoles = pgTable("ptl_roles", {
	name: varchar({ length: 50 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	roleId: serial("role_id").primaryKey().notNull(),
}, (table) => [
	unique("ptl_roles_name_unique").on(table.name),
]);

export const ptlUsersRoles = pgTable("ptl_users_roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
	roleId: integer("role_id").notNull(),
}, (table) => [
	uniqueIndex("unique_user_role").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.roleId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [ptlUsers.id],
			name: "ptl_users_roles_user_id_ptl_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [ptlRoles.roleId],
			name: "ptl_users_roles_role_id_ptl_roles_role_id_fk"
		}).onDelete("cascade"),
]);

export const properties = pgTable("properties", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }),
	location: varchar({ length: 255 }),
	bedrooms: varchar({ length: 50 }),
	bathrooms: varchar({ length: 50 }),
	size: varchar({ length: 50 }),
	date: varchar({ length: 50 }),
	amenities: text(),
	url: text(),
	propertyType: varchar("property_type", { length: 50 }),
	paymentType: varchar("payment_type", { length: 50 }),
	price: varchar({ length: 50 }),
}, (table) => [
	unique("properties_url_key").on(table.url),
]);

export const bqCategories = pgTable("bq_categories", {
	categoryId: uuid("category_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("bq_categories_name_key").on(table.name),
]);

export const bqSubcategories = pgTable("bq_subcategories", {
	subCategoryId: uuid("sub_category_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	categoryId: uuid("category_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [bqCategories.categoryId],
			name: "bq_subcategories_category_id_fkey"
		}).onDelete("cascade"),
	unique("bq_subcategories_category_id_name_key").on(table.categoryId, table.name),
]);

export const expenses = pgTable("expenses", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	expenseId: bigint("expense_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "expenses_expense_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	userId: uuid("user_id"),
	budgetId: integer("budget_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	description: varchar({ length: 255 }),
	expenseDate: date("expense_date").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_expenses_budget_id").using("btree", table.budgetId.asc().nullsLast().op("int4_ops")),
	index("idx_expenses_expense_date").using("btree", table.expenseDate.asc().nullsLast().op("date_ops")),
	index("idx_expenses_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [debitusers.userId],
			name: "expenses_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.budgetId],
			foreignColumns: [budgets.budgetId],
			name: "expenses_budget_id_fkey"
		}).onDelete("set null"),
]);

export const incomes = pgTable("incomes", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	incomeId: bigint("income_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "incomes_income_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	userId: uuid("user_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	source: varchar({ length: 100 }),
	incomeDate: date("income_date").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_incomes_income_date").using("btree", table.incomeDate.asc().nullsLast().op("date_ops")),
	index("idx_incomes_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [debitusers.userId],
			name: "incomes_user_id_fkey"
		}).onDelete("cascade"),
]);

export const budgets = pgTable("budgets", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	budgetId: bigint("budget_id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "budgets_budget_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	userId: uuid("user_id"),
	category: varchar({ length: 100 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	cadence: varchar({ length: 20 }),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	remainingAmount: numeric("remaining_amount", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_budgets_cadence").using("btree", table.cadence.asc().nullsLast().op("text_ops")),
	index("idx_budgets_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_budgets_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [debitusers.userId],
			name: "budgets_user_id_fkey"
		}).onDelete("cascade"),
	check("budgets_cadence_check", sql`(cadence)::text = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'yearly'::character varying])::text[])`),
]);

export const debitusers = pgTable("debitusers", {
	userId: uuid("user_id").defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	passwordHash: varchar("password_hash", { length: 255 }),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("debitusers_email_key").on(table.email),
]);

export const portfoliousers = pgTable("portfoliousers", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("portfoliousers_email_key").on(table.email),
]);

export const portfolioprojects = pgTable("portfolioprojects", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 500 }).notNull(),
	livedemourl: varchar({ length: 255 }),
	mediaurl: varchar({ length: 255 }),
	githuburl: varchar({ length: 255 }).notNull(),
	tags: varchar().array(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("portfolioprojects_title_key").on(table.title),
]);

export const portfolioblogposts = pgTable("portfolioblogposts", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	excerpt: varchar({ length: 500 }).notNull(),
	coverimageurl: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 255 }),
	tags: varchar().array(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("portfolioblogposts_title_key").on(table.title),
]);

export const drizzleMigrations = pgTable("__drizzle_migrations", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	appliedAt: timestamp("applied_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("__drizzle_migrations_name_key").on(table.name),
]);

export const hsRolesPermissions = pgTable("hs_roles_permissions", {
	rolePermissionId: uuid("RolePermissionId").defaultRandom().primaryKey().notNull(),
	roleId: serial("RoleId").notNull(),
	permissionId: serial("PermissionId").notNull(),
	createdAt: timestamp("Created_At", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("Updated_At", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_role_permission_idx").using("btree", table.roleId.asc().nullsLast().op("int4_ops"), table.permissionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [hsRoles.roleId],
			name: "fk_role_permission_role_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [hsPermissions.permissionId],
			name: "fk_role_permission_permission_id"
		}),
]);

export const hsUsersRoles = pgTable("hs_users_roles", {
	userRoleId: uuid("UserRoleId").defaultRandom().primaryKey().notNull(),
	userId: uuid("UserId").notNull(),
	roleId: serial("RoleId").notNull(),
	createdAt: timestamp("Created_At", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("Updated_At", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_user_role_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.roleId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [hsRoles.roleId],
			name: "fk_user_role_role_id "
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [hsUsers.userId],
			name: "fk_user_role_user_id "
		}).onDelete("cascade"),
]);

export const hsRoles = pgTable("hs_roles", {
	roleId: serial("RoleId").primaryKey().notNull(),
	name: varchar("Name", { length: 255 }).notNull(),
	createdAt: timestamp("Created_At", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("Updated_At", { mode: 'string' }),
});

export const hsVerificationTokens = pgTable("hs_verification_tokens", {
	tokenId: uuid("TokenId").defaultRandom().primaryKey().notNull(),
	userId: uuid("UserId").notNull(),
	token: varchar("Token", { length: 256 }).notNull(),
	expiresAt: timestamp("Expires_At", { mode: 'string' }).notNull(),
	createdAt: timestamp("Created_At", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [hsUsers.userId],
			name: "fk_verification_tokens_user_id"
		}),
]);

export const hsPermissions = pgTable("hs_permissions", {
	permissionId: serial("PermissionId").primaryKey().notNull(),
	name: varchar("Name", { length: 255 }).notNull(),
	module: varchar("Module", { length: 255 }).notNull(),
	action: varchar("Action", { length: 255 }).notNull(),
	createdAt: timestamp("Created_At", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("Updated_At", { mode: 'string' }),
});

export const hsUsersPermissions = pgTable("hs_users_permissions", {
	userPermissionId: uuid("UserPermissionId").defaultRandom().primaryKey().notNull(),
	userId: uuid("UserId").notNull(),
	permissionId: serial("PermissionId").notNull(),
	granted: boolean("Granted").default(true).notNull(),
	createdAt: timestamp("Created_AT", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("Updated_At", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_user_permission_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.permissionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [hsUsers.userId],
			name: "fk_user_permission_user_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [hsPermissions.permissionId],
			name: "fk_user_permission_permission_id"
		}),
]);

export const hsUsers = pgTable("hs_users", {
	userId: uuid("UserId").defaultRandom().primaryKey().notNull(),
	email: varchar("Email", { length: 255 }).notNull(),
	firstName: varchar("FirstName", { length: 255 }).notNull(),
	lastName: varchar("LastName", { length: 255 }).notNull(),
	username: varchar("Username", { length: 255 }).notNull(),
	passwordHash: varchar("PasswordHash", { length: 255 }),
	status: hsStatus("Status").default('pending'),
	createdAt: timestamp("Created_At", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("Updated_At", { mode: 'string' }),
	image: varchar("Image", { length: 255 }),
	provider: varchar("Provider", { length: 255 }),
}, (table) => [
	uniqueIndex("unique_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
]);

export const hsBusinesses = pgTable("hs_businesses", {
	businessId: uuid("BusinessId").defaultRandom().primaryKey().notNull(),
	userId: uuid().notNull(),
	email: varchar("Email", { length: 255 }).notNull(),
	businessName: varchar("BusinessName", { length: 255 }).notNull(),
	createdAt: timestamp("Created_At", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("Updated_At", { mode: 'string' }),
}, (table) => [
	uniqueIndex("unique_business_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("unique_business_name_idx").using("btree", table.businessName.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [hsUsers.userId],
			name: "fk_user_business_user_id"
		}).onDelete("cascade"),
]);

export const hsLocations = pgTable("hs_locations", {
	locationId: uuid("LocationId").defaultRandom().primaryKey().notNull(),
	businessId: uuid("BusinessId").notNull(),
	name: varchar("Name", { length: 255 }).notNull(),
	address: varchar("Address", { length: 500 }).notNull(),
	createdAt: timestamp("Created_At", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("Updated_At", { mode: 'string' }),
	phoneNumber: varchar("PhoneNumber", { length: 255 }),
	email: varchar("Email", { length: 255 }),
}, (table) => [
	uniqueIndex("unique_location_address_idx").using("btree", table.address.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [hsBusinesses.businessId],
			name: "fk_business_location_business_id"
		}).onDelete("cascade"),
]);

export const hsDepartments = pgTable("hs_departments", {
	departmentId: uuid("DepartmentId").defaultRandom().primaryKey().notNull(),
	locationId: uuid("LocationId").notNull(),
	name: varchar("Name", { length: 255 }).notNull(),
	createdAt: timestamp("Created_At", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("Updated_At", { mode: 'string' }),
	description: varchar("Description", { length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [hsLocations.locationId],
			name: "fk_department_location_location_id"
		}).onDelete("cascade"),
]);

export const bqProducts = pgTable("bq_products", {
	productId: uuid("product_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: text().notNull(),
	description: text(),
	stock: integer().default(0),
	lowStockThreshold: integer("low_stock_threshold").default(5),
	discountAmount: numeric("discount_amount", { precision: 10, scale:  2 }).default('0'),
	status: productStatusEnum().notNull(),
	isFeatured: boolean("is_featured").default(false),
	subCategoryId: uuid("sub_category_id"),
	images: jsonb().default([]),
	materials: text(),
	availableSizes: jsonb("available_sizes").default([]),
	careInstructions: text("care_instructions"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	categoryId: uuid("category_id"),
	totalSold: integer("total_sold").default(0),
	buyingPrice: numeric("buying_price", { precision: 10, scale:  2 }).notNull(),
	sellingPrice: numeric("selling_price", { precision: 10, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.subCategoryId],
			foreignColumns: [bqSubcategories.subCategoryId],
			name: "bq_products_subcategory_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [bqCategories.categoryId],
			name: "bq_products_category_id_fkey"
		}).onDelete("set null"),
	unique("bq_products_slug_key").on(table.slug),
]);

export const bqCart = pgTable("bq_cart", {
	cartId: uuid("cart_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [bqUsers.userId],
			name: "bq_cart_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [bqProducts.productId],
			name: "bq_cart_product_id_fkey"
		}).onDelete("cascade"),
	unique("bq_cart_user_id_product_id_key").on(table.userId, table.productId),
	check("bq_cart_quantity_check", sql`quantity > 0`),
]);

export const bqOrders = pgTable("bq_orders", {
	orderId: uuid("order_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	orderNumber: varchar("order_number", { length: 50 }).notNull(),
	status: orderStatusEnum().default('pending').notNull(),
	paymentStatus: paymentStatusEnum("payment_status").default('pending').notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).default('0').notNull(),
	shippingAddress: text("shipping_address").notNull(),
	placedAt: timestamp("placed_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [bqUsers.userId],
			name: "bq_orders_user_id_fkey"
		}),
	unique("bq_orders_order_number_key").on(table.orderNumber),
]);

export const bqOrderItems = pgTable("bq_order_items", {
	orderItemId: uuid("order_item_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	subtotal: numeric({ precision: 10, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [bqOrders.orderId],
			name: "bq_order_items_order_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [bqProducts.productId],
			name: "bq_order_items_product_id_fkey"
		}),
]);

export const bqProductFeedback = pgTable("bq_product_feedback", {
	productFeedbackId: uuid("product_feedback_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	rating: integer().notNull(),
	comment: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [bqProducts.productId],
			name: "bq_product_feedback_product_id_fkey"
		}).onDelete("cascade"),
	check("bq_product_feedback_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const bqWishlist = pgTable("bq_wishlist", {
	wishlistId: uuid("wishlist_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productId: uuid("product_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [bqUsers.userId],
			name: "bq_wishlist_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [bqProducts.productId],
			name: "bq_wishlist_product_id_fkey"
		}).onDelete("cascade"),
	unique("bq_wishlist_user_id_product_id_key").on(table.userId, table.productId),
]);

export const ptlTransactions = pgTable("ptl_transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	companyId: uuid("company_id").notNull(),
	userId: uuid("user_id").notNull(),
	invoiceId: uuid("invoice_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 15 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	mpesaRequestId: varchar("mpesa_request_id", { length: 100 }),
	checkoutRequestId: varchar("checkout_request_id", { length: 100 }),
	merchantRequestId: varchar("merchant_request_id", { length: 100 }),
	mpesaReceiptNumber: varchar("mpesa_receipt_number", { length: 50 }),
	stkPushRequest: jsonb("stk_push_request"),
	stkPushResponse: jsonb("stk_push_response"),
	callbackPayload: jsonb("callback_payload"),
	description: text(),
	isOnDemand: boolean("is_on_demand").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [ptlCompanies.id],
			name: "ptl_transactions_company_id_ptl_companies_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [ptlUsers.id],
			name: "ptl_transactions_user_id_ptl_users_id_fk"
		}),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [ptlInvoices.id],
			name: "ptl_transactions_invoice_id_ptl_invoices_id_fk"
		}),
]);

export const hsCustomers = pgTable("hs_customers", {
	customerId: uuid("CustomerId").defaultRandom().primaryKey().notNull(),
	businessId: uuid("BusinessId").notNull(),
	email: varchar("Email", { length: 255 }).notNull(),
	customerStatus: hsCustomerStatus("CustomerStatus").default('active').notNull(),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }).defaultNow().notNull(),
	customerName: varchar("CustomerName", { length: 255 }).notNull(),
	phoneNumber: varchar("PhoneNumber", { length: 50 }),
}, (table) => [
	uniqueIndex("unique_customer_email_business").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [hsBusinesses.businessId],
			name: "fk_customers_business_id"
		}).onDelete("cascade"),
]);

export const hsFeedbackRequests = pgTable("hs_feedback_requests", {
	feedbackRequestId: uuid("FeedbackRequestId").defaultRandom().primaryKey().notNull(),
	businessIdd: uuid("BusinessIdd").notNull(),
	locationId: uuid("LocationId"),
	departmentId: uuid("DepartmentId"),
	channel: hsFeedbackChannel("Channel").default('email').notNull(),
	templateId: uuid("TemplateId").notNull(),
	requesterId: uuid("RequesterId").notNull(),
	status: feedbackReqStatus().default('pending').notNull(),
	sentAt: timestamp("SentAt", { mode: 'string' }),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }),
	customerIds: text("CustomerIds").array().default(["RAY"]).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.businessIdd],
			foreignColumns: [hsBusinesses.businessId],
			name: "hs_feedback_requests_BusinessIdd_hs_businesses_BusinessId_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [hsLocations.locationId],
			name: "hs_feedback_requests_LocationId_hs_locations_LocationId_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [hsDepartments.departmentId],
			name: "hs_feedback_requests_DepartmentId_hs_departments_DepartmentId_f"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [hsFeedbackTemplates.templateId],
			name: "hs_feedback_requests_TemplateId_hs_feedback_templates_TemplateI"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.requesterId],
			foreignColumns: [hsUsers.userId],
			name: "hs_feedback_requests_RequesterId_hs_users_UserId_fk"
		}).onDelete("set null"),
]);

export const plans = pgTable("plans", {
	planId: uuid("PlanId").defaultRandom().primaryKey().notNull(),
	name: varchar("Name", { length: 255 }).notNull(),
	description: text("Description"),
	price: numeric("Price", { precision: 10, scale:  2 }).notNull(),
	billingCycle: hsBillingCycle("BillingCycle").notNull(),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_plan_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const planPermissions = pgTable("plan_permissions", {
	planPermissionId: uuid("PlanPermissionId").defaultRandom().primaryKey().notNull(),
	planId: uuid("PlanId").notNull(),
	permissionId: serial("PermissionId").notNull(),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_plan_permission").using("btree", table.planId.asc().nullsLast().op("int4_ops"), table.permissionId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [plans.planId],
			name: "fk_planpermissions_plan_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [hsPermissions.permissionId],
			name: "fk_planpermissions_permission_id"
		}),
]);

export const userPlans = pgTable("user_plans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	planId: uuid("plan_id").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_user_plan").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.planId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [hsUsers.userId],
			name: "fk_user_plans_user_id"
		}),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [plans.planId],
			name: "fk_user_plans_plan_id"
		}),
]);

export const subscriptions = pgTable("subscriptions", {
	subscriptionId: uuid("SubscriptionId").defaultRandom().primaryKey().notNull(),
	userPlanId: uuid("UserPlanId").notNull(),
	billingCycle: billingCycle("billing_cycle").notNull(),
	amountPaid: numeric("AmountPaid", { precision: 10, scale:  2 }).notNull(),
	nextBillingDat: timestamp("NextBillingDat", { mode: 'string' }).notNull(),
	subscriptionStatus: hsSubscriptionStatus("SubscriptionStatus").notNull(),
	charityContribution: numeric("CharityContribution", { precision: 10, scale:  2 }),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("unique_user_plan_cycle").using("btree", table.userPlanId.asc().nullsLast().op("uuid_ops"), table.billingCycle.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userPlanId],
			foreignColumns: [userPlans.id],
			name: "fk_subscription_user_plan_id"
		}),
]);

export const migrations = pgTable("migrations", {
	id: serial().primaryKey().notNull(),
	filename: varchar({ length: 255 }).notNull(),
	appliedAt: timestamp("applied_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("migrations_filename_key").on(table.filename),
]);

export const hsFeedbackResponses = pgTable("hs_feedback_responses", {
	feedbackResponseId: uuid("FeedbackResponseId").defaultRandom().primaryKey().notNull(),
	feedbackRequestId: uuid("FeedbackRequestId").notNull(),
	customerId: uuid("CustomerId").notNull(),
	submittedAt: timestamp("SubmittedAt", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }).defaultNow().notNull(),
	starRating: integer("StarRating"),
	feedbackText: text("FeedbackText"),
}, (table) => [
	foreignKey({
			columns: [table.feedbackRequestId],
			foreignColumns: [hsFeedbackRequests.feedbackRequestId],
			name: "hs_feedback_responses_FeedbackRequestId_hs_feedback_requests_Fe"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [hsCustomers.customerId],
			name: "hs_feedback_responses_CustomerId_hs_customers_CustomerId_fk"
		}).onDelete("cascade"),
]);

export const hsQuestionAnswers = pgTable("hs_question_answers", {
	questionAnswerId: uuid("QuestionAnswerId").defaultRandom().primaryKey().notNull(),
	templateQuestionId: uuid("TemplateQuestionId").notNull(),
	customerId: uuid("CustomerId").notNull(),
	answer: text().notNull(),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }).defaultNow().notNull(),
	feedbackResponseId: uuid("FeedbackResponseId").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [hsCustomers.customerId],
			name: "fk_answers_customer"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.templateQuestionId],
			foreignColumns: [hsTemplateQuestions.templateQuestionId],
			name: "fk_answers_template_question"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.feedbackResponseId],
			foreignColumns: [hsFeedbackResponses.feedbackResponseId],
			name: "hs_question_answers_FeedbackResponseId_hs_feedback_responses_Fe"
		}).onDelete("set null"),
]);

export const hsSocialMediaConnections = pgTable("hs_social_media_connections", {
	connectionId: uuid("ConnectionId").defaultRandom().primaryKey().notNull(),
	businessId: uuid("BusinessId").notNull(),
	platform: hsSocialPlatform("Platform").notNull(),
	platformAccountId: varchar("PlatformAccountId", { length: 255 }).notNull(),
	platformAccountName: varchar("PlatformAccountName", { length: 255 }).notNull(),
	accessToken: text("AccessToken").notNull(),
	refreshToken: text("RefreshToken"),
	tokenExpiresAt: timestamp("TokenExpiresAt", { mode: 'string' }),
	isActive: boolean("IsActive").default(true),
	autoPostEnabled: boolean("AutoPostEnabled").default(false),
	minRatingThreshold: varchar("MinRatingThreshold", { length: 10 }).default('4'),
	createdAt: timestamp("Created_At", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("Updated_At", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [hsBusinesses.businessId],
			name: "hs_social_media_connections_BusinessId_hs_businesses_BusinessId"
		}).onDelete("cascade"),
]);

export const bqUsers = pgTable("bq_users", {
	userId: uuid("user_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: roleEnum().notNull(),
	status: statusEnum().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deleted: integer().default(0).notNull(),
	password: text(),
}, (table) => [
	unique("bq_users_email_key").on(table.email),
]);

export const hsFeedbackTemplates = pgTable("hs_feedback_templates", {
	templateId: uuid("TemplateId").defaultRandom().primaryKey().notNull(),
	name: varchar("Name", { length: 255 }).notNull(),
	channel: hsFeedbackChannel("Channel").default('email').notNull(),
	displayCompanyLogo: boolean("DisplayCompanyLogo").default(false).notNull(),
	companyLogo: varchar("CompanyLogo", { length: 500 }),
	displayCompanyStatement: boolean("DisplayCompanyStatement").default(false).notNull(),
	companyStatement: text("CompanyStatement"),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }).defaultNow(),
	collectRatingsAndFeedback: boolean("CollectRatingsAndFeedback").default(true).notNull(),
	ratingMessage: text("RatingMessage"),
	feedbackMessage: text("FeedbackMessage"),
});

export const hsTemplateQuestions = pgTable("hs_template_questions", {
	templateQuestionId: uuid("TemplateQuestionId").defaultRandom().primaryKey().notNull(),
	templateId: uuid("TemplateId").notNull(),
	questionNumber: serial("QuestionNumber").notNull(),
	questionText: text("QuestionText").notNull(),
	fieldType: hsInputTypes("FieldType").default('input'),
	isRequired: boolean("IsRequired").default(false).notNull(),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }).defaultNow(),
	options: text("Options").array(),
	enableSentimentAnalysis: boolean("EnableSentimentAnalysis").default(false).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [hsFeedbackTemplates.templateId],
			name: "hs_template_questions_TemplateId_hs_feedback_templates_Template"
		}).onDelete("cascade"),
]);

export const hsSentimentAnalysis = pgTable("hs_sentiment_analysis", {
	sentimentAnalysisId: uuid("SentimentAnalysisId").defaultRandom().primaryKey().notNull(),
	questionAnswerId: uuid("QuestionAnswerId"),
	createdAt: timestamp("CreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("UpdatedAt", { mode: 'string' }).defaultNow().notNull(),
	feedbackResponseId: uuid("FeedbackResponseId").notNull(),
	status: analysisStatus("Status").default('pending').notNull(),
	content: text("Content").notNull(),
	sentiment: sentiment("Sentiment"),
	confidenceScore: text("ConfidenceScore"),
	keywords: text("Keywords").array(),
	summary: text("Summary"),
	eligibleForAutoPost: boolean("EligibleForAutoPost").default(false).notNull(),
	autoPostReason: text("AutoPostReason"),
	processedAt: timestamp("ProcessedAt", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.feedbackResponseId],
			foreignColumns: [hsFeedbackResponses.feedbackResponseId],
			name: "hs_sentiment_analysis_FeedbackResponseId_hs_feedback_responses_"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.questionAnswerId],
			foreignColumns: [hsQuestionAnswers.questionAnswerId],
			name: "hs_sentiment_analysis_QuestionAnswerId_hs_question_answers_Ques"
		}).onDelete("cascade"),
]);
export const dashboardSummary = pgMaterializedView("dashboard_summary", {	userId: uuid("user_id"),
	totalIncome: numeric("total_income"),
	totalExpenditure: numeric("total_expenditure"),
	balance: numeric(),
	remainingBudget: numeric("remaining_budget"),
}).as(sql`SELECT u.user_id, COALESCE(sum(i.amount), 0::numeric) AS total_income, COALESCE(sum(e.amount), 0::numeric) AS total_expenditure, COALESCE(sum(i.amount), 0::numeric) - COALESCE(sum(e.amount), 0::numeric) AS balance, COALESCE(sum(b.remaining_amount), 0::numeric) AS remaining_budget FROM debitusers u LEFT JOIN incomes i ON u.user_id = i.user_id LEFT JOIN expenses e ON u.user_id = e.user_id LEFT JOIN budgets b ON u.user_id = b.user_id GROUP BY u.user_id`);