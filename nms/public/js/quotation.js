frappe.ui.form.on("Quotation Item", {

    rate: function(frm,cdt,cdn){
        calculate_total_rate_with_vat(frm,cdt,cdn)
    },    
    item_tax_template: function(frm,cdt,cdn){
        calculate_total_rate_with_vat(frm,cdt,cdn)
    }
});

function calculate_total_rate_with_vat(frm, cdt, cdn) {
    
    let row = locals[cdt][cdn];
    console.log(row.item_tax_template)
    if (row.item_tax_template) {
        
        frappe.db.get_doc('Item Tax Template', row.item_tax_template)
            .then(doc => {
    
                let total_tax_rate = 0;
                console.log(doc)
                if (doc.taxes) {
                    
                    doc.taxes.forEach(tax => {
                        total_tax_rate += tax.tax_rate || 0; 
                    });
                }

                if (row.rate) {
                    let total_rate_with_vat = row.rate + (row.rate * (total_tax_rate / 100));
                    frappe.model.set_value(cdt, cdn, 'custom_total_rate_with_vat', total_rate_with_vat);
                }
            });
    } else {
        frappe.model.set_value(cdt, cdn, 'custom_total_rate_with_vat', row.rate || 0);
    }
}
