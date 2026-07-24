from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AvailabilityStatus(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    AVAILABILITY_STATUS_UNSPECIFIED: _ClassVar[AvailabilityStatus]
    AVAILABILITY_STATUS_AVAILABLE: _ClassVar[AvailabilityStatus]
    AVAILABILITY_STATUS_PREFERENCE: _ClassVar[AvailabilityStatus]
    AVAILABILITY_STATUS_UNAVAILABLE: _ClassVar[AvailabilityStatus]
AVAILABILITY_STATUS_UNSPECIFIED: AvailabilityStatus
AVAILABILITY_STATUS_AVAILABLE: AvailabilityStatus
AVAILABILITY_STATUS_PREFERENCE: AvailabilityStatus
AVAILABILITY_STATUS_UNAVAILABLE: AvailabilityStatus

class PlannedShift(_message.Message):
    __slots__ = ("id", "date", "number_of_persons")
    ID_FIELD_NUMBER: _ClassVar[int]
    DATE_FIELD_NUMBER: _ClassVar[int]
    NUMBER_OF_PERSONS_FIELD_NUMBER: _ClassVar[int]
    id: str
    date: str
    number_of_persons: int
    def __init__(self, id: _Optional[str] = ..., date: _Optional[str] = ..., number_of_persons: _Optional[int] = ...) -> None: ...

class Availability(_message.Message):
    __slots__ = ("user_id", "planned_shift_id", "status")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    PLANNED_SHIFT_ID_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    user_id: str
    planned_shift_id: str
    status: AvailabilityStatus
    def __init__(self, user_id: _Optional[str] = ..., planned_shift_id: _Optional[str] = ..., status: _Optional[_Union[AvailabilityStatus, str]] = ...) -> None: ...

class UserPreference(_message.Message):
    __slots__ = ("user_id", "max_shifts_per_month", "shifts_on_consecutive_days", "shifts_in_consecutive_weeks")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    MAX_SHIFTS_PER_MONTH_FIELD_NUMBER: _ClassVar[int]
    SHIFTS_ON_CONSECUTIVE_DAYS_FIELD_NUMBER: _ClassVar[int]
    SHIFTS_IN_CONSECUTIVE_WEEKS_FIELD_NUMBER: _ClassVar[int]
    user_id: str
    max_shifts_per_month: int
    shifts_on_consecutive_days: bool
    shifts_in_consecutive_weeks: bool
    def __init__(self, user_id: _Optional[str] = ..., max_shifts_per_month: _Optional[int] = ..., shifts_on_consecutive_days: _Optional[bool] = ..., shifts_in_consecutive_weeks: _Optional[bool] = ...) -> None: ...

class Assignment(_message.Message):
    __slots__ = ("planned_shift_id", "user_id")
    PLANNED_SHIFT_ID_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    planned_shift_id: str
    user_id: str
    def __init__(self, planned_shift_id: _Optional[str] = ..., user_id: _Optional[str] = ...) -> None: ...
