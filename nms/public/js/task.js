frappe.ui.form.on("Task", {
    refresh: function (frm) {
        manage_buttons(frm);
    },

    custom_is_daily_divine_log: function (frm) {
        manage_buttons(frm);
    },

    custom_is_daily_report: function (frm) {
        manage_buttons(frm);
    },

    custom_is_meal: function (frm) {
        manage_buttons(frm);
    },
    
});

function manage_buttons(frm) {
   
    frm.clear_custom_buttons();

    if (frm.doc.custom_is_daily_divine_log) {
        frm.add_custom_button(__('Daily Diving Log'), function () {
            frappe.new_doc('Daily Diving Log');
        });
    }

    if (frm.doc.custom_is_daily_report) {
        frm.add_custom_button(__('Daily Report'), function () {
            frappe.new_doc('Daily Report');
        });
    }

    if (frm.doc.custom_is_meal) {
        frm.add_custom_button(__('Meal'), function () {
            frappe.new_doc('Meal');
        });
    }
}
