// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.AssignToDialog = class AssignToDialog {
	constructor(opts) {
		$.extend(this, opts);

		this.make();
		this.set_description_from_doc();
	}
	make() {
        console.log("innnnnnnnnnnnnnn")
		let me = this;

		me.dialog = new frappe.ui.Dialog({
			title: __("Add to ToDo"),
			fields: me.get_fields(),
			primary_action_label: __("Add"),
			primary_action: function () {
				let args = me.dialog.get_values();

				if (args && args.assign_to) {
					me.dialog.set_message("Assigning...");

					frappe.call({
						method: me.method,
						args: $.extend(args, {
							doctype: me.doctype,
							name: me.docname,
							assign_to: args.assign_to,
							bulk_assign: me.bulk_assign || false,
							re_assign: me.re_assign || false,
						}),
						btn: me.dialog.get_primary_btn(),
						callback: function (r) {
							if (!r.exc) {
								if (me.callback) {
									me.callback(r);
								}
								me.dialog && me.dialog.hide();
							} else {
								me.dialog.clear_message();
							}
						},
					});
				}
			},
		});
	}
	assign_to_me() {
		let me = this;
		let assign_to = [];

		if (me.dialog.get_value("assign_to_me")) {
			assign_to.push(frappe.session.user);
		}

		me.dialog.set_value("assign_to", assign_to);
	}
	user_group_list() {
		let me = this;
		let user_group = me.dialog.get_value("assign_to_user_group");
		me.dialog.set_value("assign_to_me", 0);

		if (user_group) {
			let user_group_members = [];
			frappe.db
				.get_list("User Group Member", {
					parent_doctype: "User Group",
					filters: { parent: user_group },
					fields: ["user"],
				})
				.then((response) => {
					user_group_members = response.map((group_member) => group_member.user);
					me.dialog.set_value("assign_to", user_group_members);
				});
		}
	}
	set_description_from_doc() {
		let me = this;

		if (me.frm && me.frm.meta.title_field) {
			me.dialog.set_value("description", me.frm.doc[me.frm.meta.title_field]);
		}
	}
	get_fields() {
		let me = this;

		return [
			{
				label: __("Assign to me"),
				fieldtype: "Check",
				fieldname: "assign_to_me",
				default: 0,
				onchange: () => me.assign_to_me(),
			},
			{
				label: __("Assign To User Group"),
				fieldtype: "Link",
				fieldname: "assign_to_user_group",
				options: "User Group",
				onchange: () => me.user_group_list(),
			},
			{
				fieldtype: "MultiSelectPills",
				fieldname: "assign_to",
				label: __("Assign To"),
				reqd: true,
				get_data: function (txt) {
					return frappe.db.get_link_options("User", txt, {
						user_type: "System User",
						enabled: 1,
					});
				},
			},
			{
				fieldtype: "Section Break",
			},
			{
				label: __("Complete By"),
				fieldtype: "Date",
				fieldname: "date",
			},
			{
				fieldtype: "Column Break",
			},
			{
				label: __("Priority"),
				fieldtype: "Select",
				fieldname: "priority",
				options: [
					{
						value: "Low",
						label: __("Low"),
					},
					{
						value: "Medium",
						label: __("Medium"),
					},
					{
						value: "High",
						label: __("High"),
					},
				],
				// Pick up priority from the source document, if it exists and is available in ToDo
				default: ["Low", "Medium", "High"].includes(
					me.frm && me.frm.doc.priority ? me.frm.doc.priority : "Medium"
				),
			},
			{
				fieldtype: "Section Break",
			},
			{
				label: __("Comment"),
				fieldtype: "Small Text",
				fieldname: "description",
			},
		];
	}
};
