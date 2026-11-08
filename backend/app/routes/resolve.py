
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from uuid import uuid4

router = APIRouter(prefix="/resolve", tags=["ONE Resolve"])

# Temporary storage for reported issues
issues = []


class IssueCreate(BaseModel):
    user_name: str
    issue_type: str
    description: str


@router.post("/report")
def report_issue(issue: IssueCreate):
    new_issue = {
        "issue_id": str(uuid4())[:8],
        "user_name": issue.user_name,
        "issue_type": issue.issue_type,
        "description": issue.description,
        "status": "Open",
        "created_at": datetime.now().isoformat()
    }

    issues.append(new_issue)

    return {
        "message": "Issue reported successfully",
        "issue": new_issue
    }


@router.get("/issues")
def get_issues():
    return {
        "total": len(issues),
        "issues": issues
    }


@router.get("/issues/{issue_id}")
def get_issue(issue_id: str):
    for issue in issues:
        if issue["issue_id"] == issue_id:
            return issue

    raise HTTPException(status_code=404, detail="Issue not found")


@router.patch("/issues/{issue_id}")
def update_issue_status(issue_id: str, status: str):
    allowed_statuses = ["Open", "In Progress", "Resolved"]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    for issue in issues:
        if issue["issue_id"] == issue_id:
            issue["status"] = status
            return issue

    raise HTTPException(status_code=404, detail="Issue not found")
