

import frappe

def execute(filters=None):
	columns, data = get_columns(filters),(get_data(filters))
	frappe.errprint([data,"dt"])
	data=get_total_wise(data)
	frappe.errprint([data,"d1"])


	return columns, data

def get_total_wise(data):
	from collections import defaultdict

	totals = defaultdict(lambda: defaultdict(float))

	updated_data = []

	for entry in data:
		source_table = entry.get('source_table')
		for key in entry:
			if key not in ['estimation_name', 'sub_components']:  
				try:
					value = float(entry[key])  
					totals[source_table][key] += value
				except ValueError:
					continue  

	for entry in data:
		updated_data.append(entry)  

		if entry == data[-1] or entry['source_table'] != data[data.index(entry) + 1]['source_table']:
			total_row = {'estimation_name': entry['source_table'], 'source_table': "", 'sub_components': '<b>Total</b>'}
			total_row.update(totals[entry['source_table']])  
			updated_data.append(total_row)

	return(updated_data)



def get_data(filters):
	sql="""SELECT 
			p.name AS estimation_name,
			'Employee' AS source_table, 
			es.sub_components,
			es.price, 
			es.p_price, 
			es.price - es.p_price AS price_difference,
			es.day, 
			es.p_day, 
			es.day - es.p_day AS day_difference,
			es.amount, 
			es.p_amount, 
			es.amount - es.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabEmployee Estimation` es ON p.name = es.parent
		WHERE es.price IS NOT NULL

		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Asset' AS source_table, 
			ac.sub_components,
			ac.price, 
			ac.p_price, 
			ac.price - ac.p_price AS price_difference,
			ac.day, 
			ac.p_day, 
			ac.day - ac.p_day AS day_difference,
			ac.amount, 
			ac.p_amount, 
			ac.amount - ac.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabAsset Estimation CT` ac ON p.name = ac.parent
		WHERE ac.price IS NOT NULL

		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Sub-Contractor' AS source_table, 
			sc.sub_components,
			sc.price, 
			sc.p_price, 
			sc.price - sc.p_price AS price_difference,
			sc.day, 
			sc.p_day, 
			sc.day - sc.p_day AS day_difference,
			sc.amount, 
			sc.p_amount, 
			sc.amount - sc.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabSub-Contractor CT` sc ON p.name = sc.parent
		WHERE sc.price IS NOT NULL

		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Additional Cost' AS source_table, 
			acc.sub_components,
			acc.price, 
			acc.p_price, 
			acc.price - acc.p_price AS price_difference,
			acc.day, 
			acc.p_day, 
			acc.day - acc.p_day AS day_difference,
			acc.amount, 
			acc.p_amount, 
			acc.amount - acc.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabAdditional Cost CT` acc ON p.name = acc.parent
		WHERE acc.price IS NOT NULL

		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Site Consumable' AS source_table, 
			sct.sub_components,
			sct.price, 
			sct.p_price, 
			sct.price - sct.p_price AS price_difference,
			sct.day, 
			sct.p_day, 
			sct.day - sct.p_day AS day_difference,
			sct.amount, 
			sct.p_amount, 
			sct.amount - sct.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabSite Consumable Ct` sct ON p.name = sct.parent
		WHERE sct.price IS NOT NULL

		UNION ALL

		SELECT 
			p.name AS estimation_name,
			'Fuel Consumption' AS source_table, 
			fc.sub_components,
			fc.price, 
			fc.p_price, 
			fc.price - fc.p_price AS price_difference,
			fc.day, 
			fc.p_day, 
			fc.day - fc.p_day AS day_difference,
			fc.amount, 
			fc.p_amount, 
			fc.amount - fc.p_amount AS amount_difference
		FROM `tabEstimation` p
		LEFT JOIN `tabFuel Consumption CT` fc ON p.name = fc.parent
		WHERE fc.price IS NOT NULL;

		"""
	data=frappe.db.sql(sql,as_dict=1)
	return data


def get_columns(filters):
	columns=[]

	columns+= [
	
		{
	 		'fieldname': 'estimation_name',
            'label':('Components'),
            'fieldtype': 'Data',
			'width': 200,
			"hidden":1
        },
		{
	 		'fieldname': 'sub_components',
            'label':('Components'),
            'fieldtype': 'Data',
			'width': 200
        },
		{
	 		'fieldname': 'price',
            'label':('Price'),
            'fieldtype': 'Float',
			'width': 200
        },
		{
	 		'fieldname': 'day',
            'label':('Day'),
            'fieldtype': 'Int',
			'width': 200
        },
		{
	 		'fieldname': 'amount',
            'label':('Amount'),
            'fieldtype': 'Float',
			'width': 200
        },
		{
	 		'fieldname': 'p_price',
            'label':('Price'),
            'fieldtype': 'Float',
			'width': 200
        },
		{
	 		'fieldname': 'p_day',
            'label':('Day'),
            'fieldtype': 'Int',
			'width': 200
        },
		{
	 		'fieldname': 'p_amount',
            'label':('Amount'),
            'fieldtype': 'Float',
			'width': 200
        },
		{
	 		'fieldname': 'price_difference',
            'label':('Price'),
            'fieldtype': 'Float',
			'width': 200
        },
		{
	 		'fieldname': 'day_difference',
            'label':('Day'),
            'fieldtype': 'Int',
			'width': 200
        },
		{
	 		'fieldname': 'amount_difference',
            'label':('Amount'),
            'fieldtype': 'Float',
			'width': 200
        }]
	return columns
