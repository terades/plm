import json
from jsonata import jsonata

def transform_json_with_jsonata(json_data: dict, jsonata_expression: str) -> dict:
    """
    Transformiert ein JSON-Objekt mithilfe einer JSONata-Expression.

    Args:
        json_data (dict): Das einzugebende JSON-Objekt.
        jsonata_expression (str): Die JSONata-Expression als String.

    Returns:
        dict: Das transformierte JSON-Objekt.
    """
    try:
        j_expression = jsonata(jsonata_expression)
        transformed_data = j_expression.evaluate(json_data)
        return transformed_data
    except Exception as e:
        print(f"Fehler bei der Transformation: {e}")
        return {}

def main():
    """
    Hauptfunktion zum Abfragen von Benutzereingaben und zur Durchführung der Transformation.
    """
    # Ihre vordefinierte JSONata-Expression
    jsonata_expression = r'''
{
  "messageType": [
    "GB.D365EventProcessor.D365EventTransformed.ProductionOrderReleased"
  ],
  "timestamp": $join([FXLHeader.SystemDate, "T", FXLHeader.SystemTime, ".000Z"]),
  "productionId": ProdTable.FIELD_ProdTable_ProdId,
  "project": ProdTable.SalesTable.FIELD_SalesTable_GLDGlobalProjId ? ProdTable.SalesTable.FIELD_SalesTable_GLDGlobalProjId : null,
  "productionStatus": ProdTable.FIELD_ProdTable_ProdStatus,
  "productionSite": FXLHeader.Company,
  "productionWarehouse": ProdTable.FIELD_ProdTable_inventDim_InventLocationId,
  "plannedProductionQuantity": $number(ProdTable.FIELD_ProdTable_QtySched),
  "plannedProductionStartDateTime": $join([ProdTable.FIELD_ProdTable_SchedStart, "T", ProdTable.FIELD_ProdTable_SchedFromTime, ".000Z"]),
  "plannedProductionEndDateTime": $join([ProdTable.FIELD_ProdTable_SchedEnd, "T", ProdTable.FIELD_ProdTable_SchedToTime, ".000Z"]),
  "partListId": ProdTable.FIELD_ProdTable_gldPartlistId,
  "bomReference": ProdTable.FIELD_ProdTable_GLDCollectRefProdId,
  "bomLevel": ProdTable.FIELD_ProdTable_GLDCollectRefLevel,
  "bomListId": ProdTable.FIELD_ProdTable_BOMId,
  "inputMaterialAvailabilityDate": ProdTable.FIELD_ProdTable_gaxDisplayAvailabilityDate,
  "itemNumber": ProdTable.FIELD_ProdTable_ItemId,
  "itemName": ProdTable.FIELD_ProdTable_Name,
  "itemAbbreviation": ProdTable.InventTable.FIELD_InventTable_GLDItemAbbreviation,
  "partGrossHeight": $number(ProdTable.FIELD_ProdTable_inventTable_grossHeight),
  "partGrossWidth": $number(ProdTable.FIELD_ProdTable_inventTable_grossWidth),
  "partGrossDepth": $number(ProdTable.FIELD_ProdTable_inventTable_grossDepth),
  "partGrossWeight": $number(ProdTable.FIELD_ProdTable_inventTable_grossWeight),
  "partGrossVolume": $number(ProdTable.FIELD_ProdTable_inventTable_grossVolume),
  "resource": ProdTable.ProdRoute[0].ProdRouteJob[0].FIELD_ProdRouteJob_WrkCtrId,
  "orderNumber": ProdTable.FIELD_ProdTable_GLDICSalesId ? ProdTable.FIELD_ProdTable_GLDICSalesId : null,
  "mesColor": ProdTable.FIELD_ProdTable_GLDColor,
  "mesCoatingType": ProdTable.FIELD_ProdTable_GLDCoatingType,
  "rawMaterialProfile": ProdTable.FIELD_ProdTable_GLDRawMaterialProfileItemId,
  "rawMaterialConfig": ProdTable.FIELD_ProdTable_GLDRawMaterialConfigId,
  "rawMaterialColor": ProdTable.FIELD_ProdTable_GLDRawMaterialColor,
  "rawMaterialStyle": ProdTable.FIELD_ProdTable_GLDRawMaterialStyleId,
  "serialId": ProdTable.ProdTable.FIELD_ProdTable_inventDim_inventSerialId,
  "refProductionId": ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_ProdId,
  "referenceOrder": {
    "productionId": ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_ProdId,
    "productionStatusDescription": ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_ProdStatus1,
    "resourcePoolId": ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_GLDResourcePoolId,
    "capabilityDescription": ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_GLDWrkCtrCapabilityDescription1,
    "itemId": ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_ItemId,
    "itemName": ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_Name,
    "productionStatus": $number(ProdTable.ProdTable_GLDCollectRef.RefProdStatus),
    "scheduledDate": ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_SchedDate,
    "scheduledTime": ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_SchedFromTime,
    "scheduledDateTime": (
      $date := ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_SchedDate;
      $time := ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_SchedFromTime;
      $date and $time ? $join([$date, "T", $time, ".000Z"]) : null
    ),
    "deliveryDate": ProdTable.ProdTable_GLDCollectRef.FIELD_ProdTable_DlvDate
  },
  "successor": {
    "productionId": ProdTable.ProdTable_RefOrder.FIELD_ProdTable_ProdId,
    "productionStatusDescription": ProdTable.ProdTable_RefOrder.FIELD_ProdTable_ProdStatus1,
    "capabilityDescription": ProdTable.ProdTable_RefOrder.FIELD_ProdTable_GLDWrkCtrCapabilityDescription,
    "itemId": ProdTable.ProdTable_RefOrder.FIELD_ProdTable_ItemId,
    "itemName": ProdTable.ProdTable_RefOrder.FIELD_ProdTable_Name,
    "productionStatus": $number(ProdTable.ProdTable_RefOrder.RefProdStatus),
    "scheduledDate": ProdTable.ProdTable_RefOrder.FIELD_ProdTable_SchedDate,
    "scheduledTime": ProdTable.ProdTable_RefOrder.FIELD_ProdTable_SchedFromTime,
    "scheduledDateTime": (
      $date := ProdTable.ProdTable_RefOrder.FIELD_ProdTable_SchedDate;
      $time := ProdTable.ProdTable_RefOrder.FIELD_ProdTable_SchedFromTime;
      $date and $time ? $join([$date, "T", $time, ".000Z"]) : undefined
    )
  },
  "productionRouteOperation": ProdTable.ProdRoute.ProdRouteJob[].{
    "productionRouteJobID": FIELD_ProdRouteJob_JobId,
    "productionRouteOperationNumber": FIELD_ProdRouteJob_OprNum,
    "productionRouteOperationPriority": FIELD_ProdRouteJob_OprPriority,
    "productionRouteOperation": FIELD_ProdRouteJob_prodRoute_OprId,
    "productionRouteOperationJobType": FIELD_ProdRouteJob_JobType,
    "productionRouteOperationName": FIELD_ProdRouteJob_prodRoute_operationName,
    "productionRouteOperationRunTime": $number(FIELD_ProdRouteJob_prodRoute_ProcessTime),
    "productionRouteOperationProcessQuantity": $number(FIELD_ProdRouteJob_prodRoute_ProcessPerQty),
    "productionRouteOperationResource": FIELD_ProdRouteJob_prodRoute_displayWrkCtrId,
    "productionRouteOperationStartDateTime": $join([FIELD_ProdRouteJob_prodRoute_FromDate, "T", FIELD_ProdRouteJob_prodRoute_FromTime, ".000Z"]),
    "productionRouteOperationEndDateTime": $join([FIELD_ProdRouteJob_prodRoute_ToDate, "T", FIELD_ProdRouteJob_prodRoute_ToTime, ".000Z"]),
    "productionRouteOperationTransportTime": $number(FIELD_prodRoute_TransTime),
    "productionRouteOperationComputedEndTime": $fromMillis(
        $toMillis($join([FIELD_ProdRouteJob_prodRoute_ToDate, "T", FIELD_ProdRouteJob_prodRoute_ToTime, ".000Z"]))
        + ($number(FIELD_prodRoute_TransTime) * 60000)
      )
  },
  "bomListLine": ProdTable.ProdBOM[].{
    "partListLinePosition": FIELD_ProdBOM_LineNum,
    "partItemNumber": FIELD_ProdBOM_ItemId,
    "partOperationNumber": FIELD_ProdBOM_OprNum,
    "partProductName": FIELD_ProdBOM_itemName,
    "partQuantity": $number(FIELD_ProdBOM_BOMQty),
    "partQuantityUnit": FIELD_ProdBOM_UnitId,
    "partColor": FIELD_ProdBOM_inventDim_InventColorId,
    "partGrossHeight": $number(FIELD_ProdBOM_inventTable_grossHeight),
    "partGrossWidth": $number(FIELD_ProdBOM_inventTable_grossWidth),
    "partGrossDepth": $number(FIELD_ProdBOM_inventTable_grossDepth),
    "partGrossWeight": $number(FIELD_ProdBOM_inventTable_grossWeight),
    "partCalculatedQuantity": $number(FIELD_ProdBOM_QtyBOMCalc),
    "partRemainingQuantity": $number(FIELD_ProdBOM_RemainBOMPhysical),
    "partSize": $exists(FIELD_ProdBOM_inventDim_InventSizeId) and $not(FIELD_ProdBOM_inventDim_InventSizeId in ["", ".", null]) ? $number(FIELD_ProdBOM_inventDim_InventSizeId) : undefined,
    "partProductNumber": FIELD_ProdBOM_fxlDisplayProductNumber,
    "partConfigId": FIELD_ProdBOM_inventDim_configId,
    "partColorId": FIELD_ProdBOM_inventDim_InventColorId,
    "partSizeId": FIELD_ProdBOM_inventDim_InventSizeId,
    "partStyleId": FIELD_ProdBOM_inventDim_InventStyleId,
    "partBatchNumber": FIELD_ProdBOM_inventDim_inventBatchId,
    "inventTransId": FIELD_ProdBOM_InventTransId
  }
}
'''

    print("Bitte fügen Sie den JSON-Text ein (Beenden mit einer leeren Zeile und dann Strg+D auf Linux/macOS oder Strg+Z, Enter auf Windows):")
    json_lines = []
    while True:
        try:
            line = input()
            if not line: # Leere Zeile signalisiert Ende der Eingabe
                break
            json_lines.append(line)
        except EOFError: # Strg+D oder Strg+Z
            break
    
    input_json_str = "\n".join(json_lines)

    try:
        input_message = json.loads(input_json_str)
    except json.JSONDecodeError as e:
        print(f"Fehler beim Parsen des JSON-Inputs: {e}")
        return

    # Führen Sie die Transformation aus
    transformed_output = transform_json_with_jsonata(input_message, jsonata_expression)

    # Ausgabe des transformierten JSON im Pretty-Print-Format
    print("\n--- Transformiertes JSON ---")
    print(json.dumps(transformed_output, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
