package com.example.shizuka.config;

import com.example.shizuka.entity.Plan;
import com.example.shizuka.entity.PlanTimeSlot;
import com.example.shizuka.mapper.PlanMapper;
import com.example.shizuka.mapper.PlanTimeSlotMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class PlanSeedInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PlanSeedInitializer.class);
    private static final List<String> REQUIRED_PLAN_NAMES = List.of(
            "12種類のブレンド体験 基本コース",
            "20種類のブレンド体験 月末限定"
    );
    private static final List<String> TEMP_PLAN_NAMES = List.of(
            "アロマブレンド体験（60分）",
            "スペシャルブレンド体験（90分）",
            "プレミアムブレンド体験（120分）"
    );

    private final PlanMapper planMapper;
    private final PlanTimeSlotMapper planTimeSlotMapper;

    public PlanSeedInitializer(PlanMapper planMapper, PlanTimeSlotMapper planTimeSlotMapper) {
        this.planMapper = planMapper;
        this.planTimeSlotMapper = planTimeSlotMapper;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<Plan> plans = planMapper.findAllActive();
        if (plans == null) {
            plans = Collections.emptyList();
        }

        if (hasNonSeedPlans(plans)) {
            return;
        }

        Set<String> existingRequired = new HashSet<>();
        for (Plan plan : plans) {
            if (plan == null) {
                continue;
            }
            String name = plan.getName();
            if (name == null) {
                continue;
            }
            if (REQUIRED_PLAN_NAMES.contains(name)) {
                existingRequired.add(name);
                continue;
            }
            if (TEMP_PLAN_NAMES.contains(name) && plan.getId() != null) {
                planMapper.softDelete(plan.getId());
            }
        }

        if (existingRequired.size() < REQUIRED_PLAN_NAMES.size()) {
            seedPlans(existingRequired);
        }

        List<Plan> activeAfter = planMapper.findAllActive();
        if (activeAfter == null || activeAfter.isEmpty()) {
            return;
        }
        seedSlots(activeAfter);
    }

    private boolean hasNonSeedPlans(List<Plan> plans) {
        for (Plan plan : plans) {
            if (plan == null) {
                continue;
            }
            String name = plan.getName();
            if (name == null) {
                continue;
            }
            if (!REQUIRED_PLAN_NAMES.contains(name) && !TEMP_PLAN_NAMES.contains(name)) {
                return true;
            }
        }
        return false;
    }
    private void seedPlans(Set<String> existingRequired) {
        List<Plan> seeded = new ArrayList<>();

        if (!existingRequired.contains(REQUIRED_PLAN_NAMES.get(0))) {
            seeded.add(insertPlan(
                    REQUIRED_PLAN_NAMES.get(0),
                    "12種類の香りから4種類を選んで作る、いちばんスタンダードなコースです。はじめての方にも参加しやすく、迷ったらまずこちらがおすすめです。",
                    60,
                    4000,
                    10
            ));
        }
        if (!existingRequired.contains(REQUIRED_PLAN_NAMES.get(1))) {
            seeded.add(insertPlan(
                    REQUIRED_PLAN_NAMES.get(1),
                    "20種類の香りから4種類を選べる、月末限定の特別コースです。より多くの香りを試しながら、自分らしい奥行きのあるブレンドを楽しめます。",
                    60,
                    4000,
                    10
            ));
        }

        if (!seeded.isEmpty()) {
            log.info("Seeded {} plans for verification.", seeded.size());
        }
    }

    private Plan insertPlan(String name, String description, int durationMinutes, int price, int capacity) {
        Plan plan = new Plan();
        plan.setName(name);
        plan.setDescription(description);
        plan.setDurationMinutes(durationMinutes);
        plan.setPrice(price);
        plan.setCapacity(capacity);
        plan.setIsActive(true);
        planMapper.insert(plan);
        return plan;
    }

    private void seedSlots(List<Plan> plans) {
        Map<String, Plan> planByName = new HashMap<>();
        for (Plan plan : plans) {
            if (plan == null || plan.getName() == null) {
                continue;
            }
            planByName.put(plan.getName(), plan);
        }

        Plan plan12 = planByName.get(REQUIRED_PLAN_NAMES.get(0));
        Plan plan20 = planByName.get(REQUIRED_PLAN_NAMES.get(1));
        if (plan12 == null && plan20 == null) {
            return;
        }

        LocalDate today = LocalDate.now();
        LocalDate endDate = today.withDayOfMonth(1).plusMonths(2).minusDays(1);
        List<LocalTime> startTimes = List.of(
                LocalTime.of(11, 0),
                LocalTime.of(13, 0),
                LocalTime.of(15, 0)
        );

        int inserted = 0;
        for (LocalDate date = today; !date.isAfter(endDate); date = date.plusDays(1)) {
            boolean isHoliday = isWeekendOrHoliday(date);
            if (!isHoliday) {
                continue;
            }

            if (plan12 != null) {
                inserted += insertSlotsForDate(plan12, date, startTimes);
            }
            if (plan20 != null && isMonthEndDate(date)) {
                inserted += insertSlotsForDate(plan20, date, startTimes);
            }
        }

        if (inserted > 0) {
            log.info("Seeded {} plan time slots for verification.", inserted);
        }
    }

    private int insertSlotsForDate(Plan plan, LocalDate date, List<LocalTime> startTimes) {
        int added = 0;
        Integer capacity = plan.getCapacity();
        int cap = (capacity != null && capacity > 0) ? capacity : 10;
        for (LocalTime startTime : startTimes) {
            if (slotExists(plan.getId(), date, startTime)) {
                continue;
            }
            PlanTimeSlot slot = new PlanTimeSlot();
            slot.setPlanId(plan.getId());
            slot.setSlotDate(date);
            slot.setStartTime(startTime);
            slot.setEndTime(startTime.plusHours(1));
            slot.setCapacity(cap);
            slot.setReservedCount(0);
            slot.setIsOpen(true);
            planTimeSlotMapper.insert(slot);
            added += 1;
        }
        return added;
    }

    private boolean slotExists(Long planId, LocalDate date, LocalTime startTime) {
        if (planId == null) {
            return true;
        }
        var existing = planTimeSlotMapper.findByPlanAndSlot(planId, date, startTime);
        return existing != null && existing.isPresent();
    }

    private boolean isWeekendOrHoliday(LocalDate date) {
        switch (date.getDayOfWeek()) {
            case SATURDAY:
            case SUNDAY:
                return true;
            default:
                return isJapaneseHoliday(date);
        }
    }

    private boolean isMonthEndDate(LocalDate date) {
        int lastDay = date.lengthOfMonth();
        return date.getDayOfMonth() >= (lastDay - 6);
    }

    private boolean isJapaneseHoliday(LocalDate date) {
        return getJapaneseHolidaySet(date.getYear()).contains(date);
    }

    private Set<LocalDate> getJapaneseHolidaySet(int year) {
        Set<LocalDate> cached = holidayCache.get(year);
        if (cached != null) {
            return cached;
        }
        Set<LocalDate> holidays = new HashSet<>();
        addHoliday(holidays, LocalDate.of(year, 1, 1));
        addHoliday(holidays, getNthWeekdayOfMonth(year, 1, java.time.DayOfWeek.MONDAY, 2));
        addHoliday(holidays, LocalDate.of(year, 2, 11));
        if (year >= 2020) {
            addHoliday(holidays, LocalDate.of(year, 2, 23));
        }
        addHoliday(holidays, LocalDate.of(year, 3, getVernalEquinoxDay(year)));
        addHoliday(holidays, LocalDate.of(year, 4, 29));
        addHoliday(holidays, LocalDate.of(year, 5, 3));
        addHoliday(holidays, LocalDate.of(year, 5, 4));
        addHoliday(holidays, LocalDate.of(year, 5, 5));
        addHoliday(holidays, getNthWeekdayOfMonth(year, 7, java.time.DayOfWeek.MONDAY, 3));
        if (year >= 2016) {
            addHoliday(holidays, LocalDate.of(year, 8, 11));
        }
        addHoliday(holidays, getNthWeekdayOfMonth(year, 9, java.time.DayOfWeek.MONDAY, 3));
        addHoliday(holidays, LocalDate.of(year, 9, getAutumnEquinoxDay(year)));
        addHoliday(holidays, getNthWeekdayOfMonth(year, 10, java.time.DayOfWeek.MONDAY, 2));
        addHoliday(holidays, LocalDate.of(year, 11, 3));
        addHoliday(holidays, LocalDate.of(year, 11, 23));

        applyCitizenHoliday(year, holidays);
        applySubstituteHoliday(holidays);
        applyCitizenHoliday(year, holidays);

        holidayCache.put(year, holidays);
        return holidays;
    }

    private void addHoliday(Set<LocalDate> holidays, LocalDate date) {
        if (date != null) {
            holidays.add(date);
        }
    }

    private LocalDate getNthWeekdayOfMonth(int year, int month, java.time.DayOfWeek dayOfWeek, int nth) {
        LocalDate first = LocalDate.of(year, month, 1);
        int offset = (7 + dayOfWeek.getValue() - first.getDayOfWeek().getValue()) % 7;
        return first.plusDays(offset + (long) (nth - 1) * 7);
    }

    private int getVernalEquinoxDay(int year) {
        return (int) Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4.0));
    }

    private int getAutumnEquinoxDay(int year) {
        return (int) Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4.0));
    }

    private void applyCitizenHoliday(int year, Set<LocalDate> holidays) {
        for (int month = 1; month <= 12; month += 1) {
            int lastDay = LocalDate.of(year, month, 1).lengthOfMonth();
            for (int day = 2; day < lastDay; day += 1) {
                LocalDate date = LocalDate.of(year, month, day);
                if (holidays.contains(date)) {
                    continue;
                }
                LocalDate prev = date.minusDays(1);
                LocalDate next = date.plusDays(1);
                if (holidays.contains(prev) && holidays.contains(next) && date.getDayOfWeek() != java.time.DayOfWeek.SUNDAY) {
                    holidays.add(date);
                }
            }
        }
    }

    private void applySubstituteHoliday(Set<LocalDate> holidays) {
        List<LocalDate> sorted = new ArrayList<>(holidays);
        sorted.sort(LocalDate::compareTo);
        for (LocalDate holiday : sorted) {
            if (holiday.getDayOfWeek() != java.time.DayOfWeek.SUNDAY) {
                continue;
            }
            LocalDate substitute = holiday.plusDays(1);
            while (holidays.contains(substitute)) {
                substitute = substitute.plusDays(1);
            }
            holidays.add(substitute);
        }
    }

    private final Map<Integer, Set<LocalDate>> holidayCache = new HashMap<>();
}

