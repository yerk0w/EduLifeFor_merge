import os
import requests
import json
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, Depends, HTTPException, Header

# Настройка URL сервисов
AUTH_API_URL = os.getenv("AUTH_API_URL", "http://localhost:8070")
RASPIS_API_URL = os.getenv("RASPIS_API_URL", "http://localhost:8090")
QR_API_URL = os.getenv("QR_API_URL", "http://localhost:8080")
DOCK_API_URL = os.getenv("DOCK_API_URL", "http://localhost:8100")

class ServiceIntegration:
    def __init__(self, token: str):
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"}

    # ================= Auth Service API =================
    def get_user_info(self, user_id: int) -> Dict[str, Any]:
        """Получает информацию о пользователе из сервиса авторизации"""
        url = f"{AUTH_API_URL}/users/{user_id}"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить данные пользователя")
        return response.json()

    def get_teacher_info(self, teacher_id: int) -> Dict[str, Any]:
        """Получает информацию о преподавателе из сервиса авторизации"""
        url = f"{AUTH_API_URL}/teachers/{teacher_id}"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить данные преподавателя")
        return response.json()

    def get_student_info(self, student_id: int) -> Dict[str, Any]:
        """Получает информацию о студенте из сервиса авторизации"""
        url = f"{AUTH_API_URL}/students/{student_id}"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить данные студента")
        return response.json()

    def get_group_info(self, group_id: int) -> Dict[str, Any]:
        """Получает информацию о группе из сервиса авторизации"""
        url = f"{AUTH_API_URL}/groups/{group_id}"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить данные группы")
        return response.json()

    def get_students_by_group(self, group_id: int) -> List[Dict[str, Any]]:
        """Получает список студентов в группе из сервиса авторизации"""
        url = f"{AUTH_API_URL}/students/by-group/{group_id}"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить список студентов группы")
        return response.json()

    # ================= Raspis Service API =================
    def get_schedule(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Получает расписание из сервиса расписаний с опциональными фильтрами"""
        url = f"{RASPIS_API_URL}/schedule"
        response = requests.get(url, headers=self.headers, params=filters)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить расписание")
        return response.json()
    
    def get_schedule_by_teacher(self, teacher_id: int) -> List[Dict[str, Any]]:
        """Получает расписание для конкретного преподавателя"""
        return self.get_schedule({"teacher_id": teacher_id})
    
    def get_schedule_by_group(self, group_id: int) -> List[Dict[str, Any]]:
        """Получает расписание для конкретной группы"""
        return self.get_schedule({"group_id": group_id})
    
    def get_subjects(self) -> List[Dict[str, Any]]:
        """Получает список предметов из сервиса расписаний"""
        url = f"{RASPIS_API_URL}/subjects"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить список предметов")
        return response.json()
    
    # ================= QR Service API =================
    def generate_qr_code(self, subject_id: int, shift_id: int, teacher_id: int) -> str:
        """Генерирует QR-код для учета посещаемости через сервис QR"""
        url = f"{QR_API_URL}/qr"
        data = {
            "subject_id": subject_id,
            "shift_id": shift_id,
            "teacher_id": teacher_id
        }
        response = requests.post(url, headers=self.headers, json=data)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось сгенерировать QR-код")
        return response.json()["qr_code"]
    
    def validate_qr_code(self, user_id: int, qr_code: str) -> Dict[str, Any]:
        """Валидирует QR-код для отметки посещения"""
        url = f"{QR_API_URL}/validate_qr"
        data = {
            "user_id": user_id,
            "qr_code": qr_code
        }
        response = requests.post(url, headers=self.headers, json=data)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось валидировать QR-код")
        return response.json()
    
    def get_user_attendance(self, user_id: int) -> List[Dict[str, Any]]:
        """Получает историю посещаемости пользователя"""
        url = f"{QR_API_URL}/sessions/{user_id}"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить данные о посещаемости")
        return response.json()["sessions"]
    
    # ================= Document Service API =================
    def get_documents(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Получает список документов текущего пользователя из сервиса документооборота"""
        url = f"{DOCK_API_URL}/documents"
        params = {"skip": skip, "limit": limit}
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить список документов")
        return response.json()
    
    def get_document(self, document_id: int) -> Dict[str, Any]:
        """Получает документ по ID из сервиса документооборота"""
        url = f"{DOCK_API_URL}/documents/{document_id}"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить документ")
        return response.json()
    
    def create_document(self, title: str, content: str, template_type: Optional[str] = None) -> Dict[str, Any]:
        """Создает новый документ в сервисе документооборота"""
        url = f"{DOCK_API_URL}/documents"
        data = {
            "title": title,
            "content": content,
            "template_type": template_type
        }
        response = requests.post(url, headers=self.headers, json=data)
        if response.status_code != 201:
            raise HTTPException(status_code=response.status_code, detail="Не удалось создать документ")
        return response.json()
    
    def get_templates(self) -> List[Dict[str, Any]]:
        """Получает доступные шаблоны документов"""
        url = f"{DOCK_API_URL}/templates"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Не удалось получить список шаблонов")
        return response.json()

    # ================= Комплексные интеграции =================
    def create_attendance_report(self, group_id: int, start_date: str, end_date: str) -> Dict[str, Any]:
        """
        Создает отчет о посещаемости группы, интегрируя данные из Auth, Raspis и QR сервисов
        """
        # Получаем информацию о группе
        group_info = self.get_group_info(group_id)
        
        # Получаем список студентов группы
        students = self.get_students_by_group(group_id)
        
        # Получаем расписание группы за указанный период
        schedule = self.get_schedule_by_group(group_id)
        
        # Для каждого студента получаем историю посещений
        attendance_data = []
        for student in students:
            user_id = student["user_id"]
            attendance = self.get_user_attendance(user_id)
            
            # Вычисляем статистику посещаемости
            total_classes = len(schedule)
            attended_classes = sum(1 for a in attendance if start_date <= a.get("session_time", "").split(" ")[0] <= end_date)
            
            attendance_data.append({
                "student_id": student["id"],
                "student_name": student["full_name"],
                "total_classes": total_classes,
                "attended_classes": attended_classes,
                "attendance_percent": round(attended_classes / total_classes * 100 if total_classes else 0, 2)
            })
        
        # Создаем отчет в виде документа
        report_content = f"""
        # Отчет о посещаемости группы {group_info['name']}
        
        Период: с {start_date} по {end_date}
        
        ## Сводная информация
        
        | Студент | Посещено занятий | Всего занятий | Процент посещаемости |
        |---------|------------------|---------------|----------------------|
        """
        
        for data in attendance_data:
            report_content += f"| {data['student_name']} | {data['attended_classes']} | {data['total_classes']} | {data['attendance_percent']}% |\n"
        
        # Сохраняем отчет как документ
        document = self.create_document(
            title=f"Отчет о посещаемости группы {group_info['name']} ({start_date} - {end_date})",
            content=report_content
        )
        
        return {
            "document_id": document["id"],
            "group_info": group_info,
            "period": {"start": start_date, "end": end_date},
            "attendance_data": attendance_data
        }
    
    def create_attendance_request(self, student_id: int, date: str, reason: str) -> Dict[str, Any]:
        """
        Создает заявление о пропуске занятия, используя данные из Auth, Raspis и Dock сервисов
        """
        # Получаем информацию о студенте
        student_info = self.get_student_info(student_id)
        
        # Получаем информацию о группе студента
        group_info = self.get_group_info(student_info["group_id"])
        
        # Получаем расписание группы на указанную дату
        schedule = self.get_schedule({"group_id": student_info["group_id"], "date": date})
        
        # Получаем шаблон для заявления
        templates = self.get_templates()
        permission_slip_template = next((t for t in templates if "отпуск" in t["name"].lower()), None)
        
        # Формируем содержимое заявления
        content = f"""
        Директору ВУЗа
        от студента группы {group_info['name']}
        {student_info['full_name']}
        
        ЗАЯВЛЕНИЕ
        
        Прошу освободить меня от занятий {date} по причине: {reason}.
        
        Список занятий в этот день:
        """
        
        for idx, lesson in enumerate(schedule, 1):
            content += f"\n{idx}. {lesson['subject_name']} ({lesson['time_start']} - {lesson['time_end']})"
        
        content += f"\n\nДата: {date}\nПодпись: ___________"
        
        # Создаем документ заявления
        document = self.create_document(
            title=f"Заявление о пропуске занятий ({date})",
            content=content,
            template_type=permission_slip_template["name"] if permission_slip_template else None
        )
        
        return {
            "document_id": document["id"],
            "student_info": student_info,
            "date": date,
            "reason": reason,
            "schedule": schedule
        }
    
    def create_reference_for_student(self, student_id: int) -> Dict[str, Any]:
        """
        Создает справку с места учебы, используя данные из Auth и Dock сервисов
        """
        # Получаем информацию о студенте
        student_info = self.get_student_info(student_id)
        
        # Получаем информацию о группе студента
        group_info = self.get_group_info(student_info["group_id"])
        
        # Получаем шаблон для справки
        templates = self.get_templates()
        reference_template = next((t for t in templates if "справка" in t["name"].lower()), None)
        
        # Текущая дата для справки
        from datetime import datetime
        current_date = datetime.now().strftime("%d.%m.%Y")
        
        # Формируем содержимое справки
        content = f"""
        СПРАВКА
        
        Дана {student_info['full_name']} в том, что он(а) действительно является 
        студентом(кой) {student_info['group_year']} курса группы {group_info['name']} 
        факультета {group_info['faculty_name']}.
        
        Справка выдана для предъявления по месту требования.
        
        Дата выдачи: {current_date}
        Декан факультета: _____________ / ____________
        Секретарь: _____________ / ____________
        
        М.П.
        """
        
        # Создаем документ справки
        document = self.create_document(
            title=f"Справка с места учебы для {student_info['full_name']}",
            content=content,
            template_type=reference_template["name"] if reference_template else None
        )
        
        return {
            "document_id": document["id"],
            "student_info": student_info,
            "group_info": group_info,
            "issue_date": current_date
        }

# Функция для создания экземпляра интеграции на основе токена
def get_integration_service(authorization: str = Header(None)):
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Не предоставлен токен авторизации")
    
    token = authorization.replace("Bearer ", "")
    return ServiceIntegration(token)

# Пример использования в FastAPI приложении
app = FastAPI(
    title="EduLife Integration API",
    description="API для интеграции микросервисов EduLife",
    version="1.0.0",
)

@app.get("/integration/health")
def health_check():
    return {"status": "healthy", "services": [
        {"name": "auth", "url": AUTH_API_URL},
        {"name": "raspis", "url": RASPIS_API_URL},
        {"name": "qr", "url": QR_API_URL},
        {"name": "dock", "url": DOCK_API_URL}
    ]}

@app.post("/integration/attendance-report/{group_id}")
def create_group_attendance_report(
    group_id: int, 
    start_date: str, 
    end_date: str,
    integration: ServiceIntegration = Depends(get_integration_service)
):
    """Создает отчет о посещаемости для всей группы"""
    return integration.create_attendance_report(group_id, start_date, end_date)

@app.post("/integration/absence-request/{student_id}")
def create_absence_request(
    student_id: int,
    date: str,
    reason: str,
    integration: ServiceIntegration = Depends(get_integration_service)
):
    """Создает заявление о пропуске занятий для студента"""
    return integration.create_attendance_request(student_id, date, reason)

@app.post("/integration/reference/{student_id}")
def create_student_reference(
    student_id: int,
    integration: ServiceIntegration = Depends(get_integration_service)
):
    """Создает справку с места учебы для студента"""
    return integration.create_reference_for_student(student_id)

@app.get("/integration/teacher-schedule/{teacher_id}")
def get_teacher_schedule_with_details(
    teacher_id: int,
    integration: ServiceIntegration = Depends(get_integration_service)
):
    """Получает детальное расписание преподавателя с данными о группах и предметах"""
    schedule = integration.get_schedule_by_teacher(teacher_id)
    teacher_info = integration.get_teacher_info(teacher_id)
    
    enriched_schedule = []
    for lesson in schedule:
        group_info = integration.get_group_info(lesson["group_id"])
        
        enriched_lesson = {
            **lesson,
            "teacher_name": teacher_info["full_name"],
            "teacher_position": teacher_info["position"],
            "teacher_department": teacher_info["department_name"],
            "group_name": group_info["name"],
            "faculty_name": group_info["faculty_name"],
            "group_year": group_info["year"]
        }
        enriched_schedule.append(enriched_lesson)
    
    return {
        "teacher_info": teacher_info,
        "schedule": enriched_schedule
    }

@app.get("/integration/student-attendance/{student_id}")
def get_student_attendance(
    student_id: int,
    integration: ServiceIntegration = Depends(get_integration_service)
):
    """Получает данные о посещаемости студента с деталями занятий"""
    student_info = integration.get_student_info(student_id)
    user_id = student_info["user_id"]
    
    # Получаем историю посещений
    attendance_history = integration.get_user_attendance(user_id)
    
    # Получаем расписание группы
    group_schedule = integration.get_schedule_by_group(student_info["group_id"])
    
    # Обогащаем данные о посещениях информацией о занятиях
    enriched_attendance = []
    for record in attendance_history:
        # Ищем соответствующее занятие в расписании
        matching_lesson = next(
            (lesson for lesson in group_schedule 
             if lesson.get("subject_id") == record.get("subject_id") and
                lesson.get("teacher_id") == record.get("teacher_id")),
            None
        )
        
        enriched_record = {
            **record,
            "subject_name": matching_lesson.get("subject_name", "Неизвестный предмет") if matching_lesson else "Неизвестный предмет",
            "teacher_name": matching_lesson.get("teacher_name", "Неизвестный преподаватель") if matching_lesson else "Неизвестный преподаватель",
            "classroom": matching_lesson.get("classroom_name", "Неизвестная аудитория") if matching_lesson else "Неизвестная аудитория"
        }
        enriched_attendance.append(enriched_record)
    
    return {
        "student_info": student_info,
        "attendance": enriched_attendance
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8110)