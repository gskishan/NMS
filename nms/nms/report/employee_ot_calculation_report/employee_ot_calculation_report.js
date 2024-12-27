// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.query_reports["Employee OT Calculation Report"] = {
	"filters": [
        {
            "fieldname": "employee",
            "label": __("Employee"),
            "fieldtype": "Link",
            "options": "Employee",
            "reqd": 0,
            "width": "80px"
        },
        {
            "fieldname": "month",
            "label": __("Month"),
            "fieldtype": "Select",
            "options": "\nJanuary\nFebruary\nMarch\nApril\nMay\nJune\nJuly\nAugust\nSeptember\nOctober\nNovember\nDecember",
            "reqd": 0, 
            "width": "80px"
        },
        {
            "fieldname": "year",
            "label": __("Year"),
            "fieldtype": "Int",
            "default": new Date().getFullYear(), 
            "reqd": 1
        }
    ]
};

