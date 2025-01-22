frappe.listview_settings['Task'] = {
    onload: function (listview) {
        listview.page.add_inner_button(__('Create Sales Invoice'), function () {
            const selected_tasks = listview.get_checked_items();

            if (selected_tasks.length === 0) {
                frappe.msgprint(__('Please select at least one task.'));
                return;
            }

            create_sales_invoice_from_tasks(selected_tasks);
        });
    },
};

function create_sales_invoice_from_tasks(selected_tasks) {
    const task_names = selected_tasks.map(task => task.name);
    console.log(task_names);

    const task_promises = task_names.map(task_name => 
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Task",
                name: task_name,
            }
        }).then(res => res.message)
    );

    Promise.all(task_promises).then(tasks => {
        if (tasks && tasks.length > 0) {
            console.log(tasks);

            const sales_orders = [...new Set(tasks.map(task => task.custom_sales_order))];

            if (sales_orders.length > 1) {
                frappe.msgprint(__('Selected tasks must have the same Sales Order.'));
                return;
            }

            const sales_order = sales_orders[0];
            if (!sales_order) {
                frappe.msgprint(__('Selected tasks must have a valid Sales Order.'));
                return;
            }

            const items = [];
            const task_references = [];

            tasks.forEach(task => {
                (task.custom_task_items || []).forEach(item => {
                    items.push({
                        item_code: item.item_code,
                        item_name: item.item_name,
                        qty: item.qty,
                        rate: item.rate,
                        description: item.description,
                        uom: item.uom,
                        stock_uom: item.uom,
                        custom_vessels: item.vessels,
                        custom_location: item.location,
                        custom_work_type: item.work_type,
                    });
                    task_references.push(task.name);
                });
            });

            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Sales Invoice",
                    filters: { docstatus: 1 },
                    fields: ["name"]
                },
                callback: function (response) {
                    if (response.message.length === 0) {
                        process_items_income_account(items).then(updated_items => {
                            create_sales_invoice(sales_order, tasks, updated_items, task_references);
                        });
                        return;
                    }

                    const invoice_promises = response.message.map(invoice =>
                        frappe.call({
                            method: "frappe.client.get",
                            args: { doctype: "Sales Invoice", name: invoice.name }
                        }).then(res => res.message)
                    );

                    Promise.all(invoice_promises).then(full_invoices => {
                        let invoiced_tasks = [];

                        full_invoices.forEach(invoice => {
                            if (invoice.custom_refer && Array.isArray(invoice.custom_refer)) {
                                invoice.custom_refer.forEach(reference => {
                                    if (task_references.includes(reference.task)) {
                                        invoiced_tasks.push(reference.task);
                                    }
                                });
                            }
                        });

                        if (invoiced_tasks.length > 0) {
                            const invoiced_tasks_str = invoiced_tasks.join(", ");
                            frappe.msgprint(__('Invoice has already been created for the following tasks: ') + invoiced_tasks_str);
                            return;
                        }

                        process_items_income_account(items).then(updated_items => {
                            create_sales_invoice(sales_order, tasks, updated_items, task_references);
                        });
                    }).catch(err => {
                        console.error(err);
                        frappe.msgprint(__('An error occurred while validating invoices.'));
                    });
                }
            });
        } else {
            frappe.msgprint(__('No valid tasks found.'));
        }
    }).catch(err => {
        console.error(err);
        frappe.msgprint(__('An error occurred while fetching task data.'));
    });
}

function process_items_income_account(items) {
    const income_account_promises = items.map(item =>
        frappe.db.get_doc("Item", item.item_code).then(item_doc => {
            if (item_doc && item_doc.item_defaults && item_doc.item_defaults.length > 0) {
                item.income_account = item_doc.item_defaults[0].income_account;
            }
            return item;
        })
    );

    return Promise.all(income_account_promises);
}

function create_sales_invoice(sales_order, tasks, items, task_references) {
    frappe.model.with_doctype("Sales Invoice", function () {
        let si = frappe.model.get_new_doc("Sales Invoice");

        frappe.db.get_doc("Sales Order", sales_order).then(so_doc => {
            if (so_doc && so_doc.customer) {
                si.customer = so_doc.customer;
                si.cost_center = so_doc.cost_center;
                si.contract_type = so_doc.contract_type;
                si.custom_client = so_doc.custom_client;
                si.project = so_doc.project;
                si.custom_sales_order = sales_order;

                si.custom_lead = tasks[0].custom_lead;
                si.custom_planning = tasks[0].custom_planning;
                si.custom_estimation = tasks[0].custom_estimation;
                si.custom_quotation = tasks[0].custom_quotation;

                items.forEach(item => {
                    let si_item = frappe.model.add_child(si, "items");

                    si_item.item_code = item.item_code;
                    si_item.item_name = item.item_name;
                    si_item.qty = item.qty;
                    si_item.rate = item.rate;
                    si_item.description = item.description;
                    si_item.uom = item.uom;
                    si_item.stock_uom = item.uom;
                    si_item.income_account = item.income_account;
                    si_item.custom_vessels = item.custom_vessels;
                    si_item.custom_location = item.custom_location;
                    si_item.custom_work_type = item.custom_work_type;

                    frappe.model.set_value(si_item.doctype, si_item.name, "income_account", item.income_account);
                });

                task_references.forEach(task_name => {
                    let si_refer = frappe.model.add_child(si, "custom_refer");
                    si_refer.task = task_name;
                });

                frappe.set_route("Form", "Sales Invoice", si.name);
            } else {
                frappe.msgprint(__('Sales Order not found.'));
            }
        });
    });
}
