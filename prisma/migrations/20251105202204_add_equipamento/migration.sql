-- CreateTable
CREATE TABLE "Equipamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "serial" TEXT,
    "mac" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "dataEntrada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSaida" DATETIME,
    "destino" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_serial_key" ON "Equipamento"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_mac_key" ON "Equipamento"("mac");
