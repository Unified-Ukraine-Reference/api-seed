CREATE TABLE "location_types" (
	"code" varchar(1) PRIMARY KEY NOT NULL,
	"level" smallint,
	"name_ua" text NOT NULL,
	"name_en" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"code" varchar(19) PRIMARY KEY NOT NULL,
	"name_ua" text NOT NULL,
	"name_en" text NOT NULL,
	"category_code" varchar(1) NOT NULL,
	"parent_code" varchar(19),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_category_code_location_types_code_fk" FOREIGN KEY ("category_code") REFERENCES "public"."location_types"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_code_locations_code_fk" FOREIGN KEY ("parent_code") REFERENCES "public"."locations"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "locations_parent_idx" ON "locations" USING btree ("parent_code");--> statement-breakpoint
CREATE INDEX "locations_category_idx" ON "locations" USING btree ("category_code");