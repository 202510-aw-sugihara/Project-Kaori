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
import java.util.List;

@Component
public class PlanSeedInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PlanSeedInitializer.class);

    private final PlanMapper planMapper;
    private final PlanTimeSlotMapper planTimeSlotMapper;

    public PlanSeedInitializer(PlanMapper planMapper, PlanTimeSlotMapper planTimeSlotMapper) {
        this.planMapper = planMapper;
        this.planTimeSlotMapper = planTimeSlotMapper;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<Plan> plans = planMapper.findAllActive();
        if (plans == null || plans.isEmpty()) {
            plans = seedPlans();
        }

        if (plans == null || plans.isEmpty()) {
            return;
        }

        var existingSlots = planTimeSlotMapper.search(null, null, null, 1, 0);
        if (existingSlots != null && !existingSlots.isEmpty()) {
            return;
        }

        seedSlots(plans);
    }

    private List<Plan> seedPlans() {
        List<Plan> seeded = new ArrayList<>();

        seeded.add(insertPlan(
                "アロマブレンド体験（60分）",
                "季節の香りを選んでブレンドするショート体験です。",
                60,
                4000,
                10
        ));
        seeded.add(insertPlan(
                "スペシャルブレンド体験（90分）",
                "香りのストーリーを深掘りしながら作る人気プランです。",
                90,
                6000,
                8
        ));
        seeded.add(insertPlan(
                "プレミアムブレンド体験（120分）",
                "ゆったり相談しながら仕上げるロングプランです。",
                120,
                8000,
                6
        ));

        log.info("Seeded {} plans for verification.", seeded.size());
        return seeded;
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
        LocalDate slotDate = LocalDate.now().plusDays(7);
        LocalTime startTime = LocalTime.of(11, 0);

        for (Plan plan : plans) {
            Integer duration = plan.getDurationMinutes();
            int minutes = (duration != null && duration > 0) ? duration : 60;
            PlanTimeSlot slot = new PlanTimeSlot();
            slot.setPlanId(plan.getId());
            slot.setSlotDate(slotDate);
            slot.setStartTime(startTime);
            slot.setEndTime(startTime.plusMinutes(minutes));
            slot.setCapacity(plan.getCapacity() != null ? plan.getCapacity() : 10);
            slot.setReservedCount(0);
            slot.setIsOpen(true);
            planTimeSlotMapper.insert(slot);
        }

        log.info("Seeded {} plan time slots for verification.", plans.size());
    }
}
