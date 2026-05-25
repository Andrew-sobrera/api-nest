CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED');


CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "expected_delivery_date" TIMESTAMP(3) NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_document" TEXT NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "order_id" TEXT NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);


CREATE UNIQUE INDEX "users_email_key" ON "users"("email");


CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");


CREATE INDEX "orders_status_idx" ON "orders"("status");


CREATE INDEX "orders_expected_delivery_date_idx" ON "orders"("expected_delivery_date");


CREATE INDEX "orders_deleted_at_idx" ON "orders"("deleted_at");

CREATE INDEX "orders_order_number_idx" ON "orders"("order_number");

CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
