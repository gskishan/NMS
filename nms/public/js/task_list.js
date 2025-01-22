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

    const task_promises = task_names.map(task_name => 
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Task",
                name: task_name,
            }
        }).then(res => res.message) // Get the full task document
    );

    Promise.all(task_promises).then(tasks => {
        if (tasks && tasks.length > 0) {
            console.log(tasks)
            // Ensure all tasks have the same Sales Order
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
                        custom_task: task.name,
                        custom_vessels: item.vessels,
                        custom_location: item.location,
                        custom_work_type: item.work_type,
                    });
                    task_references.push(task.name);
                    console.log(item);
                });
            });

            // Use frappe.call to fetch Sales Invoices
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Sales Invoice",
                    filters: { docstatus: 1 }, // Only look at submitted invoices
                    fields: ["name", "custom_refer"]
                },
                callback: function (response) {
                    let invoiced_tasks = [];

                    // Manually check the custom_refer child table in each invoice
                    response.message.forEach(invoice => {
                        invoice.custom_refer.forEach(reference => {
                            if (task_references.includes(reference.task)) {
                                invoiced_tasks.push(reference.task);
                            }
                        });
                    });

                    if (invoiced_tasks.length > 0) {
                        // If a task has been invoiced, show an error message
                        const invoiced_tasks_str = invoiced_tasks.join(", ");
                        frappe.msgprint(__('Invoice has already been created for the following tasks: ') + invoiced_tasks_str);
                        return;
                    }

                    // Proceed with creating the invoice if no tasks are invoiced
                    process_items_income_account(items).then(updated_items => {
                        create_sales_invoice(sales_order, tasks, updated_items, task_references);
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
            return item; // Return the updated item
        })
    );

    return Promise.all(income_account_promises);
}

function create_sales_invoice(sales_order, tasks, items, task_references) {
    frappe.model.with_doctype("Sales Invoice", function () {
        let si = frappe.model.get_new_doc("Sales Invoice");

        // Set Sales Order fields first
        frappe.db.get_doc("Sales Order", sales_order).then(so_doc => {
            if (so_doc && so_doc.customer) {
                si.customer = so_doc.customer;
                si.cost_center = so_doc.cost_center;
                si.contract_type = so_doc.contract_type;
                si.custom_client = so_doc.custom_client;
                si.project = so_doc.project;
                si.custom_sales_order = sales_order;

                // Set additional task fields (use the first task for reference)
                si.custom_lead = tasks[0].custom_lead;
                si.custom_planning = tasks[0].custom_planning;
                si.custom_estimation = tasks[0].custom_estimation;
                si.custom_quotation = tasks[0].custom_quotation;

                // Add items using add_child
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

                    // Set the income account for the item
                    frappe.model.set_value(si_item.doctype, si_item.name, "income_account", item.income_account);
                });

                // Add task references to the custom_refer child table
                task_references.forEach(task_name => {
                    let si_refer = frappe.model.add_child(si, "custom_refer");  // Add to custom_refer child table
                    si_refer.task = task_name;  // Reference task

                    // You can add more fields here, like status or other task info, as needed
                });

                // After adding all items and references, navigate to the Sales Invoice form
                frappe.set_route("Form", "Sales Invoice", si.name);
            } else {
                frappe.msgprint(__('Sales Order not found.'));
            }
        });
    });
}
