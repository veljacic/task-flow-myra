CREATE INDEX "idx_sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_sessions_revoked_at" ON "sessions" USING btree ("revoked_at");--> statement-breakpoint
CREATE INDEX "idx_sessions_user_revoked" ON "sessions" USING btree ("user_id","revoked_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_user_id" ON "tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_due_date" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_tasks_deleted_at" ON "tasks" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_created_at" ON "tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_user_deleted" ON "tasks" USING btree ("user_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_user_status_deleted" ON "tasks" USING btree ("user_id","status","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_user_due_deleted" ON "tasks" USING btree ("user_id","due_date","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");