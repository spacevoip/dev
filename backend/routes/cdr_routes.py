from flask import Blueprint, jsonify
from datetime import datetime, timedelta
import mysql.connector
from database import get_database_connection

cdr_routes = Blueprint('cdr_routes', __name__)

@cdr_routes.route('/cdr/today/<accountcode>', methods=['GET'])
def get_today_calls(accountcode):
    try:
        # Conecta ao banco de dados
        conn = get_database_connection()
        cursor = conn.cursor(dictionary=True)

        # Pega a data de hoje
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Query para contar chamadas do dia para o accountcode específico
        query = """
        SELECT COUNT(*) as count 
        FROM cdr 
        WHERE DATE(calldate) = %s 
        AND accountcode = %s
        """
        
        # Executa a query
        cursor.execute(query, (today, accountcode))
        result = cursor.fetchone()
        
        # Fecha a conexão
        cursor.close()
        conn.close()

        return jsonify({
            'count': result['count'] if result else 0,
            'date': today
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
